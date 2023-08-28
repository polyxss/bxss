# Dancer in the Dark: Synthesizing and Evaluating Polyglots for Blind Cross-Site Scripting

This is the companion repository for our USENIX Security submission. Follow this README to learn how to generate new polyglots, and how to minimize and evaluate existing ones.

## Tl;dr;

Install Docker and docker-compose. Start MCTS polyglot synthesis with exemplary parameters, takes about 15 minutes and generates one polyglot.

```bash
$ USERID=$(id -u) GROUPID=$(id -g) RUN_IDENTIFIER=compose-test docker-compose -p bxss-mcts up -d --build;  # up
$ # ... wait
$ docker-compose -p bxss-mcts down;  # down
```

Your polyglot will appear in the `payload` JSON-field in the file `data/out/runs/run-<timestamp>/try-1/best-polyglot/bestOutput-00000final`.

## STRUCTURE

*Listing the relevant files only.*

	├── data
	│   ├── example.json
	│   └── out
	├── generation
	|   ├── minimizer.ts
	|   └── polytest.ts
	└── testbed

- `data/` contains a JSON file with an exemplary polyglot
- `testbed/` contains the small testbed
- `generation/runner` contains our implementations of the different runner types (MCTS, Random, Greedy, RL)
- `generation/tree/tokens.ts` contains our tokenset and the grammar
- `generation/polytest.ts` contains the polyglot evaluation
- `generation/minimizer.ts` contains the polyglot minimization

## DOCKER SETUP

### SYNTHESIS WITH DOCKER-COMPOSE (RECOMMENDED)

We have prepared a compose file for the generation process.
*With the given parameters it approximately takes 5h to conclude with Docker confined to 8GB RAM and 8 cores.*
You need to install the [`docker-compose`](https://docs.docker.com/compose/install/) plugin or `docker compose`.

Use our scripts [start-mcts-with-id.sh](./start-mcts-with-id.sh) and [stop.sh](./stop.sh) or the commands below.
The start script takes a run identifier string as a parameter and starts generation as a daemon process (due to the `-d` flag).
The predefined start values in [docker-compose.yml](./docker-compose.yml) require a total of 500 testbed calls and should take **about 15 minutes** to finish. Note, that the default parameters are optimized for testing the whole process and will most likely not yield very good polyglots after such a short runtime.
For even faster runtime for resting, refer to the end of the [GENERATION](#generation) section.

```bash
# Start docker-compose as a daemon
$ mkdir -p data/out/runs;
$ USERID=$(id -u) GROUPID=$(id -g) RUN_IDENTIFIER=compose-test docker-compose -p bxss-mcts up -d --build;
```

*Note:* This approach allows scaling of individual containers via `--scale`.
For example use `USERID=$(id -u) GROUPID=$(id -g) RUN_IDENTIFIER=compose-test docker-compose -p bxss-mcts up --scale mcts=10 -d --build` to start 10 (independent) instances of MCTS generation.
Each instance will create it's own output folder.

Lookup your container names via `docker ps` and investigate running containers via `docker logs`, like `docker logs -f bxss-mcts-mcts-1`.

```bash
$ docker ps
$ docker logs -f bxss-mcts-mcts-1  # replace container name if needed
```

When the generation process finishes with the given tasks, outputs in `data/out/runs/run-<timestamp>/try-1/` will be created.
The number of tries, i.e., amount of complementing polyglots generated, corresponds to  `--maxGenerationTries` (1 in this example).

```txt
data/out/runs
└── run-2023-08-28T13:49:11.354Z
    ├── meta.json  # save of the run's configuration
    ├── summary
    │   └── final-polyglots  # resulting polyglot set
    └── try-1
        ├── best-polyglot
        │   ├── bestOutput-0000000000  # intermediary
        │   |── bestOutput-...
		│   └── bestOutput-00000final  # final 1st polyglot
        └── tree  # internal output
```

You find the (final) polyglot of a try in the corresponding `run-<timestamp>/try-<try-number>/best-polyglot/bestOutput-00000final` file.

``` json
{
	"score": 15,
	"output": {
		"timestamp": "2023-08-28T14:05:18.377Z",
		"entryNode": "...",
		"lastNode": "...",
		"payload": "<example payload>",
		"scores": "[...]",
		"wins": 15
	}
}
```

The relevant field is `"payload"`. `wins` and `score` represent the score on the local testbed. The other fields are internal fields for debugging.

```bash
# Stop docker-compose
docker-compose -p bxss-mcts stop

# Stop & remove docker-compose
docker-compose -p bxss-mcts down
```

Please refer to the next sections for instructions regarding individual Docker containers.

---

### DOCKER CONTAINER

Build one Docker container for generation, minimization and polyglot testing.
We tag it `bxss`.

```BASH
$ mkdir data data/out
$ docker build --build-arg USERID=$(id -u) --build-arg GROUPID=$(id -g) -t bxss .
```

## START

The generation process requires the small testbed to be running and reachable. Follow the next steps to start the testbed and run a generation process choosing one of our supported generation methods.

### GENERATION

Start the small testbed at http://localhost:8080. The local testbed also hosts a remote script at http://localhost:8080/xss.js which contains `console.log("xss")`. Some token or combinations of tokens try to import this remote script in the generation process. It can be easily exchanged later.

Generation can only run when the local testbed is reachable at port 8080.

```BASH
$ cd testbed && ts-node server.ts
```

Call [main.ts](./generation/main.ts) with default parameters using the Docker container build in the previous steps. Refer to [generation/](./generation/README.md) for more information on the parameters.

```BASH
$ docker run -v ./data:/usr/src/data -e RUN_IDENTIFIER="my-generation" -e NO_SANDBOX=1 bxss main.ts
```

*Passing `NO_SANDBOX` is optional, see [Troubleshooting](#troubleshooting).*

[main.ts](./generation/main.ts) first conducts a few sanity checks before commencing with MCTS.

```txt
main.ts process running
Running with LocalTesterFactory
http://host.docker.internal:8080 is reachable.
http://host.docker.internal:8080/xss.js is reachable.
Test remaining 35 ...
```

Depending on the configuration, this process can take minutes to days.
Configurations with short run times may not yield good polyglots.
For testing, we offer the following rough examples:

- <5 minutes runtime
  - `--runnerType="MCTS" --maxGenerationTries=1 --simulationsPerAction=10 --maxRootDepth=10`
- ~15 minutes runtime
  - `--runnerType="MCTS" --maxGenerationTries=1 --simulationsPerAction=50 --maxRootDepth=10`
- ~5 hours runtime
  - `--runnerType="MCTS" --maxGenerationTries=2 --simulationsPerAction=500 --maxRootDepth=10`
- ~2.5 days runtime
  - `--runnerType="MCTS" --maxGenerationTries=1 --simulationsPerAction=1200 --maxRootDepth=10`

### MINIMIZATION

Final runs are saved in `data/out/runs/<run-timestamp>/summary/final-polyglots`.
To use the minimizer, create a JSON file with the format:

```JSON
{
    "payload": "<polyglot from the final-polyglots file>"
}
```

You can use the existing `/data/example.json` file as a reference.

*Please note that minimization will only work for payloads build with the same tokenset minimizer uses. Additionally, due to Docker-Host networking, you have to replace localhost and 127.0.0.1 in the payload with host.docker.internal, so that the Docker container can reach the testbed hosted in the host network.*

```BASH
$ docker run -v ./data:/usr/src/data -e NO_SANDBOX=1 bxss minimizer.ts /usr/src/data/example.json /usr/src/data/out/minimizer
```

```txt
Start /usr/src/generation/minimizer.ts
Start minimization of [...]
Successful tests (baseline):  34
Mask: [ 0 ]
Successful tests 24 / 34
Mask: [ 1 ]
Successful tests 34 / 34
Mask: [ 2 ]
```

### PAYLOAD TESTING

Payloads can be evaluated on a state-of-the-art XSS testbed based on the Google Firing Range.
In order to detect XSS, the payload MUST write "xss" to the console, e.g., via `console.log("xss")`.

The `polytest.ts` command takes two arguments: an input JSON file in the same structure as used by [minimization](#minimization), and an output directory.
Make sure both files and directories exist.

```BASH
$ docker run -v ./data:/data bxss polytest.ts /data/example.json /data/out
```

*Note that the default setup uses the **public firing range**, thereby transmitting your polyglot to Google. Instead, you can host a local GFR instance via (publicly available) Docker images or instantiate it locally. You can pass your own firing range URL to Docker during the build process, e.g., via `docker build -t bxss . --build-arg="FIRING_RANGE_URL=http://localhost:8081"` or pass it to the run command, e.g., via `docker run -v ./data:/data -e FIRING_RANGE_URL="http://localhost:8081" bxss polytest.ts /data/example.json /data/out`. For example, you could use `docker run -d -p 8081:8080 0xshyam/firingrange` to use a public image and run it on port 8081, locally. The same applies to other ARGs defined in Dockerfile.*

This `docker run` call mounts the local `./data` folder to the container's `/usr/src/data` directory.
Make sure the local file to test `./data/example.json` exists, as well as the output folder `./data/out`.

```txt
Start /usr/src/generation/polytest.ts
Evaluating payload from: /data/example.json
Successful tests: 36/175
Done
```

## TROUBLESHOOTING

- "Unable to launch browser, error message: Could not find browser revision ..."
  - Delete the corresponding `node_modules` folder and run `$ npm install` again
- If your Docker container cannot access your mounted folders due to permission problems, then your USERID and GROUPID is probably not correctly passed to the container during build.
  - In the Docker build command, exchange `id -u` and `id -g` with commands fit for your OS
  - Easy workaround: allow access for all users and groups `$ chmod 777 data`
- "Unable to launch browser, error message: Failed to launch the browser process!"
  - Pass `-e NO_SANDBOX="1"` to `docker run`
- On Linux it may be necessary to enable `--add-host=host.docker.internal:host-gateway` in the Docker run command, in order for `host.docker.internal` to correctly resolve
