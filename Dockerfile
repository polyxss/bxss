FROM node:16-bullseye

# ---------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------
# Build ARGs can be passed to docker build with --build-arg
ARG USERID
ARG GROUPID
ARG UNAME=pptruser
ARG NO_SANDBOX=1
ARG FIRING_RANGE_URL=https://public-firing-range.appspot.com
ARG TESTBED_URL=http://host.docker.internal:8080
ARG REMOTE_SCRIPT_URL=http://host.docker.internal:8080/xss.js

# ---------------------------------------------------------------
ENV TESTBED_URL=$TESTBED_URL
ENV FIRING_RANGE_URL=$FIRING_RANGE_URL
ENV REMOTE_SCRIPT_URL=$REMOTE_SCRIPT_URL
# ---------------------------------------------------------------

# Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version of Chromium that Puppeteer installs, work.
RUN  apt-get update \
     && apt-get install -y wget gnupg ca-certificates procps libxss1 \
     && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
     && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
     && apt-get update \
     # We install Chrome to get all the OS level dependencies, but Chrome itself
     # is not actually used as it's packaged in the node puppeteer library.
     && apt-get install -y google-chrome-stable \
     && rm -rf /var/lib/apt/lists/* \
     && wget --quiet https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh -O /usr/sbin/wait-for-it.sh \
     && chmod +x /usr/sbin/wait-for-it.sh \
	&& npm install --silent -g typescript@latest ts-node@latest

WORKDIR /usr/src/
COPY ./generation/ generation/
# required to save the commit hash to the outputs
COPY ./.git /usr/src/.git

WORKDIR /usr/src/generation
RUN rm -rf node_modules && rm -f package-lock.json \
	&& npm install --silent \
	# Run puppeteers installation script manually to make it work
	&& node node_modules/puppeteer/install.js \
	# Try to allow sandbox for Chrome; if problems persist, set NO_SANDBOX=0
	&& echo 'kernel.unprivileged_userns_clone=1' > /etc/sysctl.d/userns.conf \
	&& echo $USERID && echo $GROUPID \
	# Run everything after as non-privileged user
	&& groupadd -r --gid $GROUPID -o $UNAME && \
	useradd -r -g $UNAME -o --uid $USERID -G audio,video $UNAME \
	&& chown -R $UNAME:$UNAME /usr/src/ \
	&& chown -R $UNAME:$UNAME /usr/src/generation/

USER $UNAME

ENTRYPOINT [ "ts-node" ]
