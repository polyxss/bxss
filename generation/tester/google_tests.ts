export enum ACTION {
	VISIT,
	COOKIE,
	LOCAL_STORAGE,
	SESSION_STORAGE,
	POST_MESSAGE,
	CLICK_A_TAG,
	TYPING_EVENT,
	WINDOW_NAME,
	REFERER,
	CLICK_AREA_TAG,
	FORM_WITH_INPUT,
	FORM_WITH_INPUT_Q,
	FORM_URL_PARAM,
	FORM_WITH_INPUT_USER,
	COOKIE2,
	COMPLEX_MESSAGE,
	JSON_URL_MESSAGE,
	JSON_HTML_MESSAGE,
	CLICK_DIV_TAG,
	CLICK_TAG_TAG,
	CLICK_INPUT_TAG,
	CLICK_BUTTON
}
export interface Test {
	id?: number;
	idx?: number,
	url: string;
	action: ACTION;
	baseUrl: string;
}

export interface TestInformation {
	test_id: number;
	path: string;
	action: keyof typeof ACTION;
	category?: string;
}

export function TESTS(url: string = "https://public-firing-range.appspot.com"): Test[] {
	return [
		{
			url: url + "/reflected/parameter/body?q=",
			baseUrl: "/reflected/parameter/body?q=",
			action: ACTION.VISIT,
		},
		{
			url: url + "/reflected/parameter/head?q=",
			baseUrl: "/reflected/parameter/head?q=",
			action: ACTION.VISIT,
		},
		{
			url: url + "/reflected/parameter/title?q=",
			baseUrl: "/reflected/parameter/title?q=",
			action: ACTION.VISIT,
		},
		{
			url: url + "/reflected/parameter/body_comment?q=",
			baseUrl: "/reflected/parameter/body_comment?q=",
			action: ACTION.VISIT,
		},
		{
			url: url + "/reflected/parameter/tagname?q=",
			baseUrl: "/reflected/parameter/tagname?q=",
			action: ACTION.VISIT,
		},
		{
			url: url + "/reflected/parameter/attribute_unquoted?q=",
			baseUrl: "/reflected/parameter/attribute_unquoted?q=",
			action: ACTION.VISIT,
		},
		{
			url: url + "/reflected/parameter/attribute_singlequoted?q=",
			baseUrl: "/reflected/parameter/attribute_singlequoted?q=",
			action: ACTION.VISIT,
		},
		{
			url: url + "/reflected/parameter/attribute_quoted?q=",
			baseUrl: "/reflected/parameter/attribute_quoted?q=",
			action: ACTION.VISIT,
		},
		{
			url: url + "/reflected/parameter/attribute_name?q=",
			baseUrl: "/reflected/parameter/attribute_name?q=",
			action: ACTION.VISIT,
		},
		{
			url: url + "/reflected/parameter/body/400?q=",
			baseUrl: "/reflected/parameter/body/400?q=",
			action: ACTION.VISIT,
		},
		{
			url: url + "/reflected/parameter/body/401?q=",
			baseUrl: "/reflected/parameter/body/401?q=",
			action: ACTION.VISIT,
		},
		{
			url: url + "/reflected/parameter/body/403?q=",
			baseUrl: "/reflected/parameter/body/403?q=",
			action: ACTION.VISIT,
		},
		{
			url: url + "/reflected/parameter/body/404?q=",
			baseUrl: "/reflected/parameter/body/404?q=",
			action: ACTION.VISIT,
		},
		{
			url: url + "/reflected/parameter/body/500?q=",
			baseUrl: "/reflected/parameter/body/500?q=",
			action: ACTION.VISIT,
		},
		{
			url: url + "/reflected/parameter/iframe_attribute_value?q=",
			baseUrl: "/reflected/parameter/iframe_attribute_value?q=",
			action: ACTION.VISIT,
		},
		{
			url: url + "/reflected/parameter/iframe_srcdoc?q=",
			baseUrl: "/reflected/parameter/iframe_srcdoc?q=",
			action: ACTION.VISIT,
		},
		{
			url: url + "/reflected/parameter/textarea?q=",
			baseUrl: "/reflected/parameter/textarea?q=",
			action: ACTION.VISIT,
		},
		{
			url: url + "/reflected/parameter/textarea_attribute_value?q=",
			baseUrl: "/reflected/parameter/textarea_attribute_value?q=",
			action: ACTION.VISIT,
		},
		{
			url: url + "/reflected/parameter/noscript?q=",
			baseUrl: "/reflected/parameter/noscript?q=",
			action: ACTION.VISIT,
		},
		{
			url: url + "/reflected/parameter/style_attribute_value?q=",
			baseUrl: "/reflected/parameter/style_attribute_value?q=",
			action: ACTION.VISIT,
		},
		{
			url: url + "/reflected/parameter/css_style?q=",
			baseUrl: "/reflected/parameter/css_style?q=",
			action: ACTION.VISIT,
		},
		{
			url: url + "/reflected/parameter/css_style_value?q=",
			baseUrl: "/reflected/parameter/css_style_value?q=",
			action: ACTION.VISIT,
		},
		{
			url: url + "/reflected/parameter/css_style_font_value?q=",
			baseUrl: "/reflected/parameter/css_style_font_value?q=",
			action: ACTION.VISIT,
		},
		{
			url: url + "/reflected/escapedparameter/js_eventhandler_unquoted/UNQUOTED_ATTRIBUTE?q=",
			baseUrl: "/reflected/escapedparameter/js_eventhandler_unquoted/UNQUOTED_ATTRIBUTE?q=",
			action: ACTION.VISIT,
		},
		{
			url: url + "/reflected/escapedparameter/js_eventhandler_quoted/DOUBLE_QUOTED_ATTRIBUTE?q=",
			baseUrl: "/reflected/escapedparameter/js_eventhandler_quoted/DOUBLE_QUOTED_ATTRIBUTE?q=",
			action: ACTION.VISIT,
		},
		{
			url: url + "/reflected/escapedparameter/js_eventhandler_singlequoted/SINGLE_QUOTED_ATTRIBUTE?q=",
			baseUrl: "/reflected/escapedparameter/js_eventhandler_singlequoted/SINGLE_QUOTED_ATTRIBUTE?q=",
			action: ACTION.VISIT,
		},
		{
			url: url + "/reflected/parameter/js_assignment?q=",
			baseUrl: "/reflected/parameter/js_assignment?q=",
			action: ACTION.VISIT,
		},
		{
			url: url + "/reflected/parameter/js_eval?q=",
			baseUrl: "/reflected/parameter/js_eval?q=",
			action: ACTION.VISIT,
		},
		{
			url: url + "/reflected/parameter/js_quoted_string?q=",
			baseUrl: "/reflected/parameter/js_quoted_string?q=",
			action: ACTION.VISIT,
		},
		{
			url: url + "/reflected/parameter/js_singlequoted_string?q=",
			baseUrl: "/reflected/parameter/js_singlequoted_string?q=",
			action: ACTION.VISIT,
		},
		{
			url: url + "/reflected/parameter/js_slashquoted_string?q=",
			baseUrl: "/reflected/parameter/js_slashquoted_string?q=",
			action: ACTION.VISIT,
		},
		{
			url: url + "/reflected/parameter/js_comment?q=",
			baseUrl: "/reflected/parameter/js_comment?q=",
			action: ACTION.VISIT,
		},
		{
			url: url + "/reflected/parameter/attribute_script?q=",
			baseUrl: "/reflected/parameter/attribute_script?q=",
			action: ACTION.VISIT,
		},
		{
			url: url + "/reflected/url/href?q=",
			baseUrl: "/reflected/url/href?q=",
			action: ACTION.VISIT,
		},
		{
			url: url + "/reflected/url/css_import?q=",
			baseUrl: "/reflected/url/css_import?q=",
			action: ACTION.VISIT,
		},
		{
			url: url + "/reflected/url/script_src?q=",
			baseUrl: "/reflected/url/script_src?q=",
			action: ACTION.VISIT,
		},
		{
			url: url + "/reflected/url/object_data?q=",
			baseUrl: "/reflected/url/object_data?q=",
			action: ACTION.VISIT,
		},
		{
			url: url + "/reflected/url/object_param?q=",
			baseUrl: "/reflected/url/object_param?q=",
			action: ACTION.VISIT,
		},
		{
			url: url + "/reflected/parameter/json?q=",
			baseUrl: "/reflected/parameter/json?q=",
			action: ACTION.VISIT,
		},
		{
			url: url + "/reflected/contentsniffing/json?q=",
			baseUrl: "/reflected/contentsniffing/json?q=",
			action: ACTION.VISIT,
		},
		{
			url: url + "/reflected/contentsniffing/plaintext?q=",
			baseUrl: "/reflected/contentsniffing/plaintext?q=",
			action: ACTION.VISIT,
		},
		{
			url: url + "/reflected/filteredcharsets/body/SpaceDoubleQuoteSlashEquals?q=",
			baseUrl: "/reflected/filteredcharsets/body/SpaceDoubleQuoteSlashEquals?q=",
			action: ACTION.VISIT,
		},
		{
			url: url + "/reflected/filteredcharsets/attribute_unquoted/DoubleQuoteSinglequote?q=",
			baseUrl: "/reflected/filteredcharsets/attribute_unquoted/DoubleQuoteSinglequote?q=",
			action: ACTION.VISIT,
		},
		{
			url: url + "/reflected/filteredstrings/body/caseSensitive/script?q=",
			baseUrl: "/reflected/filteredstrings/body/caseSensitive/script?q=",
			action: ACTION.VISIT,
		},
		{
			url: url + "/reflected/filteredstrings/body/caseSensitive/SCRIPT?q=",
			baseUrl: "/reflected/filteredstrings/body/caseSensitive/SCRIPT?q=",
			action: ACTION.VISIT,
		},
		{
			url: url + "/reflected/filteredstrings/body/caseInsensitive/script?q=",
			baseUrl: "/reflected/filteredstrings/body/caseInsensitive/script?q=",
			action: ACTION.VISIT,
		},

		{
			url: url + "/escape/serverside/escapeHtml/body?q=",
			baseUrl: "/escape/serverside/escapeHtml/body?q=",
			action: ACTION.VISIT,
		},

		{
			url: url + "/escape/serverside/encodeUrl/body?q=",
			baseUrl: "/escape/serverside/encodeUrl/body?q=",
			action: ACTION.VISIT,
		},

		{
			url: url + "/escape/serverside/escapeHtml/head?q=",
			baseUrl: "/escape/serverside/escapeHtml/head?q=",
			action: ACTION.VISIT,
		},

		{
			url: url + "/escape/serverside/encodeUrl/head?q=",
			baseUrl: "/escape/serverside/encodeUrl/head?q=",
			action: ACTION.VISIT,
		},

		{
			url: url + "/escape/serverside/escapeHtml/body_comment?q=",
			baseUrl: "/escape/serverside/escapeHtml/body_comment?q=",
			action: ACTION.VISIT,
		},

		{
			url: url + "/escape/serverside/encodeUrl/body_comment?q=",
			baseUrl: "/escape/serverside/encodeUrl/body_comment?q=",
			action: ACTION.VISIT,
		},

		{
			url: url + "/escape/serverside/escapeHtml/textarea?q=",
			baseUrl: "/escape/serverside/escapeHtml/textarea?q=",
			action: ACTION.VISIT,
		},

		{
			url: url + "/escape/serverside/encodeUrl/textarea?q=",
			baseUrl: "/escape/serverside/encodeUrl/textarea?q=",
			action: ACTION.VISIT,
		},

		{
			url: url + "/escape/serverside/escapeHtml/tagname?q=",
			baseUrl: "/escape/serverside/escapeHtml/tagname?q=",
			action: ACTION.VISIT,
		},

		{
			url: url + "/escape/serverside/encodeUrl/tagname?q=",
			baseUrl: "/escape/serverside/encodeUrl/tagname?q=",
			action: ACTION.VISIT,
		},

		{
			url: url + "/escape/serverside/escapeHtml/attribute_unquoted?q=",
			baseUrl: "/escape/serverside/escapeHtml/attribute_unquoted?q=",
			action: ACTION.VISIT,
		},

		{
			url: url + "/escape/serverside/encodeUrl/attribute_unquoted?q=",
			baseUrl: "/escape/serverside/encodeUrl/attribute_unquoted?q=",
			action: ACTION.VISIT,
		},

		{
			url: url + "/escape/serverside/escapeHtml/attribute_singlequoted?q=",
			baseUrl: "/escape/serverside/escapeHtml/attribute_singlequoted?q=",
			action: ACTION.VISIT,
		},

		{
			url: url + "/escape/serverside/encodeUrl/attribute_singlequoted?q=",
			baseUrl: "/escape/serverside/encodeUrl/attribute_singlequoted?q=",
			action: ACTION.VISIT,
		},

		{
			url: url + "/escape/serverside/escapeHtml/attribute_quoted?q=",
			baseUrl: "/escape/serverside/escapeHtml/attribute_quoted?q=",
			action: ACTION.VISIT,
		},

		{
			url: url + "/escape/serverside/encodeUrl/attribute_quoted?q=",
			baseUrl: "/escape/serverside/encodeUrl/attribute_quoted?q=",
			action: ACTION.VISIT,
		},

		{
			url: url + "/escape/serverside/escapeHtml/attribute_name?q=",
			baseUrl: "/escape/serverside/escapeHtml/attribute_name?q=",
			action: ACTION.VISIT,
		},

		{
			url: url + "/escape/serverside/encodeUrl/attribute_name?q=",
			baseUrl: "/escape/serverside/encodeUrl/attribute_name?q=",
			action: ACTION.VISIT,
		},

		{
			url: url + "/escape/serverside/escapeHtml/css_style?q=",
			baseUrl: "/escape/serverside/escapeHtml/css_style?q=",
			action: ACTION.VISIT,
		},

		{
			url: url + "/escape/serverside/encodeUrl/css_style?q=",
			baseUrl: "/escape/serverside/encodeUrl/css_style?q=",
			action: ACTION.VISIT,
		},

		{
			url: url + "/escape/serverside/encodeUrl/css_style_value?q=",
			baseUrl: "/escape/serverside/encodeUrl/css_style_value?q=",
			action: ACTION.VISIT,
		},

		{
			url: url + "/escape/serverside/escapeHtml/css_style_font_value?q=",
			baseUrl: "/escape/serverside/escapeHtml/css_style_font_value?q=",
			action: ACTION.VISIT,
		},

		{
			url: url + "/escape/serverside/encodeUrl/css_style_font_value?q=",
			baseUrl: "/escape/serverside/encodeUrl/css_style_font_value?q=",
			action: ACTION.VISIT,
		},
		{
			url: url + "/escape/serverside/escapeHtml/js_assignment?q=",
			baseUrl: "/escape/serverside/escapeHtml/js_assignment?q=",
			action: ACTION.VISIT,
		},

		{
			url: url + "/escape/serverside/encodeUrl/js_assignment?q=",
			baseUrl: "/escape/serverside/encodeUrl/js_assignment?q=",
			action: ACTION.VISIT,
		},

		{
			url: url + "/escape/serverside/escapeHtml/js_eval?q=",
			baseUrl: "/escape/serverside/escapeHtml/js_eval?q=",
			action: ACTION.VISIT,
		},

		{
			url: url + "/escape/serverside/encodeUrl/js_eval?q=",
			baseUrl: "/escape/serverside/encodeUrl/js_eval?q=",
			action: ACTION.VISIT,
		},

		{
			url: url + "/escape/serverside/escapeHtml/js_quoted_string?q=",
			baseUrl: "/escape/serverside/escapeHtml/js_quoted_string?q=",
			action: ACTION.VISIT,
		},

		{
			url: url + "/escape/serverside/encodeUrl/js_quoted_string?q=",
			baseUrl: "/escape/serverside/encodeUrl/js_quoted_string?q=",
			action: ACTION.VISIT,
		},

		{
			url: url + "/escape/serverside/escapeHtml/js_singlequoted_string?q=",
			baseUrl: "/escape/serverside/escapeHtml/js_singlequoted_string?q=",
			action: ACTION.VISIT,
		},

		{
			url: url + "/escape/serverside/encodeUrl/js_singlequoted_string?q=",
			baseUrl: "/escape/serverside/encodeUrl/js_singlequoted_string?q=",
			action: ACTION.VISIT,
		},
		{
			url: url + "/escape/serverside/escapeHtml/js_slashquoted_string?q=",
			baseUrl: "/escape/serverside/escapeHtml/js_slashquoted_string?q=",
			action: ACTION.VISIT,
		},
		{
			url: url + "/escape/serverside/encodeUrl/js_slashquoted_string?q=",
			baseUrl: "/escape/serverside/encodeUrl/js_slashquoted_string?q=",
			action: ACTION.VISIT,
		},
		{
			url: url + "/escape/serverside/escapeHtml/js_comment?q=",
			baseUrl: "/escape/serverside/escapeHtml/js_comment?q=",
			action: ACTION.VISIT,
		},

		{
			url: url + "/escape/serverside/encodeUrl/js_comment?q=",
			baseUrl: "/escape/serverside/encodeUrl/js_comment?q=",
			action: ACTION.VISIT,
		},

		{
			url: url + "/escape/serverside/escapeHtml/attribute_script?q=",
			baseUrl: "/escape/serverside/escapeHtml/attribute_script?q=",
			action: ACTION.VISIT,
		},

		{
			url: url + "/escape/serverside/encodeUrl/attribute_script?q=",
			baseUrl: "/escape/serverside/encodeUrl/attribute_script?q=",
			action: ACTION.VISIT,
		},

		{
			url: url + "/escape/serverside/escapeHtml/href?q=",
			baseUrl: "/escape/serverside/escapeHtml/href?q=",
			action: ACTION.VISIT,
		},

		{
			url: url + "/escape/serverside/encodeUrl/href?q=",
			baseUrl: "/escape/serverside/encodeUrl/href?q=",
			action: ACTION.VISIT,
		},

		{
			url: url + "/escape/serverside/escapeHtml/css_import?q=",
			baseUrl: "/escape/serverside/escapeHtml/css_import?q=",
			action: ACTION.VISIT,
		},

		{
			url: url + "/escape/serverside/encodeUrl/css_import?q=",
			baseUrl: "/escape/serverside/encodeUrl/css_import?q=",
			action: ACTION.VISIT,
		},

		{
			url: url + "/escape/js/escape?q=",
			baseUrl: "/escape/js/escape?q=",
			action: ACTION.VISIT,
		},

		{
			url: url + "/escape/js/encodeURIComponent?q=",
			baseUrl: "/escape/js/encodeURIComponent?q=",
			action: ACTION.VISIT,
		},

		{
			url: url + "/escape/js/html_escape?q=",
			baseUrl: "/escape/js/html_escape?q=",
			action: ACTION.VISIT,
		},

		{
			url: url + "/address/location.hash/assign#",
			baseUrl: "/address/location.hash/assign#",
			action: ACTION.VISIT,
		},

		{
			url: url + "/address/location.hash/documentwrite#",
			baseUrl: "/address/location.hash/documentwrite#",
			action: ACTION.VISIT,
		},

		{
			url: url + "/address/location.hash/documentwriteln#",
			baseUrl: "/address/location.hash/documentwriteln#",
			action: ACTION.VISIT,
		},

		{
			url: url + "/address/location.hash/eval#",
			baseUrl: "/address/location.hash/eval#",
			action: ACTION.VISIT,
		},

		{
			url: url + "/address/location.hash/innerHtml#",
			baseUrl: "/address/location.hash/innerHtml#",
			action: ACTION.VISIT,
		},

		{
			url: url + "/address/location.hash/rangeCreateContextualFragment#",
			baseUrl: "/address/location.hash/rangeCreateContextualFragment#",
			action: ACTION.VISIT,
		},

		{
			url: url + "/address/location.hash#",
			baseUrl: "/address/location.hash#",
			action: ACTION.VISIT,
		},

		{
			url: url + "/address/location.hash/setTimeout#",
			baseUrl: "/address/location.hash/setTimeout#",
			action: ACTION.VISIT,
		},

		{
			url: url + "/address/location.hash/function#",
			baseUrl: "/address/location.hash/function#",
			action: ACTION.VISIT,
		},

		{
			url: url + "/address/location.hash/onclickSetAttribute#",
			baseUrl: "/address/location.hash/onclickSetAttribute#",
			action: ACTION.VISIT,
		},

		{
			url: url + "/address/location.hash/onclickAddEventListener#",
			baseUrl: "/address/location.hash/onclickAddEventListener#",
			action: ACTION.VISIT,
		},

		{
			url: url + "/address/location.hash/jshref#",
			baseUrl: "/address/location.hash/jshref#",
			action: ACTION.VISIT,
		},

		{
			url: url + "/address/location.hash/inlineevent#",
			baseUrl: "/address/location.hash/inlineevent#",
			action: ACTION.VISIT,
		},

		{
			url: url + "/address/location/assign",
			baseUrl: "/address/location/assign",
			action: ACTION.VISIT,
		},

		{
			url: url + "/address/location/documentwrite",
			baseUrl: "/address/location/documentwrite",
			action: ACTION.VISIT,
		},

		{
			url: url + "/address/location/documentwriteln",
			baseUrl: "/address/location/documentwriteln",
			action: ACTION.VISIT,
		},

		{
			url: url + "/address/location/eval",
			baseUrl: "/address/location/eval",
			action: ACTION.VISIT,
		},

		{
			url: url + "/address/location/innerHtml",
			baseUrl: "/address/location/innerHtml",
			action: ACTION.VISIT,
		},

		{
			url: url + "/address/location/rangeCreateContextualFragment",
			baseUrl: "/address/location/rangeCreateContextualFragment",
			action: ACTION.VISIT,
		},

		{
			url: url + "/address/location/replace",
			baseUrl: "/address/location/replace",
			action: ACTION.VISIT,
		},

		{
			url: url + "/address/location/setTimeout",
			baseUrl: "/address/location/setTimeout",
			action: ACTION.VISIT,
		},

		{
			url: url + "/address/documentURI/documentwrite#",
			baseUrl: "/address/documentURI/documentwrite#",
			action: ACTION.VISIT,
		},

		{
			url: url + "/address/baseURI/documentwrite#",
			baseUrl: "/address/baseURI/documentwrite#",
			action: ACTION.VISIT,
		},

		{
			url: url + "/address/locationhref/documentwrite#",
			baseUrl: "/address/locationhref/documentwrite#",
			action: ACTION.VISIT,
		},

		{
			url: url + "/address/locationpathname/documentwrite#",
			baseUrl: "/address/locationpathname/documentwrite#",
			action: ACTION.VISIT,
		},

		{
			url: url + "/address/locationsearch/documentwrite#",
			baseUrl: "/address/locationsearch/documentwrite#",
			action: ACTION.VISIT,
		},

		{
			url: url + "/address/URL/documentwrite#",
			baseUrl: "/address/URL/documentwrite#",
			action: ACTION.VISIT,
		},

		{
			url: url + "/address/URLUnencoded/documentwrite#",
			baseUrl: "/address/URLUnencoded/documentwrite#",
			action: ACTION.VISIT,
		},

		{
			url: url + "/dom/dompropagation#",
			baseUrl: "/dom/dompropagation#",
			action: ACTION.VISIT,
		},

		{
			url: url + "/urldom/location/search/location.assign?",
			baseUrl: "/urldom/location/search/location.assign?",
			action: ACTION.VISIT,
		},

		{
			url: url + "/urldom/location/search/frame.src?",
			baseUrl: "/urldom/location/search/frame.src?",
			action: ACTION.VISIT,
		},

		{
			url: url + "/urldom/location/hash/embed.src#",
			baseUrl: "/urldom/location/hash/embed.src#",
			action: ACTION.VISIT,
		},

		{
			url: url + "/urldom/location/hash/object.data#",
			baseUrl: "/urldom/location/hash/object.data#",
			action: ACTION.VISIT,
		},
		{
			url: url + "/escape/serverside/escapeHtml/css_style_value?escape=HTML_ESCAPE&q=",
			baseUrl: "/escape/serverside/escapeHtml/css_style_value?escape=HTML_ESCAPE&q=",
			action: ACTION.VISIT,
		},
		{
			url: url + "/dom/toxicdom/document/cookie_set/eval",
			baseUrl: "/dom/toxicdom/document/cookie_set/eval",
			action: ACTION.COOKIE,
		},
		{
			url: url + "/dom/toxicdom/document/cookie_set/innerHtml",
			baseUrl: "/dom/toxicdom/document/cookie_set/innerHtml",
			action: ACTION.COOKIE,
		},
		{
			url: url + "/dom/toxicdom/document/cookie_set/documentWrite",
			baseUrl: "/dom/toxicdom/document/cookie_set/documentWrite",
			action: ACTION.COOKIE,
		},
		{
			url: url + "/dom/toxicdom/document/cookie/eval",
			baseUrl: "/dom/toxicdom/document/cookie/eval",
			action: ACTION.COOKIE2,
		},
		{
			url: url + "/dom/toxicdom/localStorage/array/eval",
			baseUrl: "/dom/toxicdom/localStorage/array/eval",
			action: ACTION.LOCAL_STORAGE,
		},
		{
			url: url + "/dom/toxicdom/localStorage/function/eval",
			baseUrl: "/dom/toxicdom/localStorage/function/eval",
			action: ACTION.LOCAL_STORAGE,
		},

		{
			url: url + "/dom/toxicdom/localStorage/function/innerHtml",
			baseUrl: "/dom/toxicdom/localStorage/function/innerHtml",
			action: ACTION.LOCAL_STORAGE,
		},

		{
			url: url + "/dom/toxicdom/localStorage/function/documentWrite",
			baseUrl: "/dom/toxicdom/localStorage/function/documentWrite",
			action: ACTION.LOCAL_STORAGE,
		},

		{
			url: url + "/dom/toxicdom/localStorage/property/documentWrite",
			baseUrl: "/dom/toxicdom/localStorage/property/documentWrite",
			action: ACTION.LOCAL_STORAGE,
		},

		{
			url: url + "/dom/toxicdom/external/localStorage/array/eval",
			baseUrl: "/dom/toxicdom/external/localStorage/array/eval",
			action: ACTION.LOCAL_STORAGE,
		},

		{
			url: url + "/dom/toxicdom/external/localStorage/function/eval",
			baseUrl: "/dom/toxicdom/external/localStorage/function/eval",
			action: ACTION.LOCAL_STORAGE,
		},

		{
			url: url + "/dom/toxicdom/external/localStorage/function/innerHtml",
			baseUrl: "/dom/toxicdom/external/localStorage/function/innerHtml",
			action: ACTION.LOCAL_STORAGE,
		},

		{
			url: url + "/dom/toxicdom/external/localStorage/function/documentWrite",
			baseUrl: "/dom/toxicdom/external/localStorage/function/documentWrite",
			action: ACTION.LOCAL_STORAGE,
		},

		{
			url: url + "/dom/toxicdom/external/localStorage/property/documentWrite",
			baseUrl: "/dom/toxicdom/external/localStorage/property/documentWrite",
			action: ACTION.LOCAL_STORAGE,
		},
		{
			url: url + "/dom/toxicdom/sessionStorage/array/eval",
			baseUrl: "/dom/toxicdom/sessionStorage/array/eval",
			action: ACTION.SESSION_STORAGE,
		},
		{
			url: url + "/dom/toxicdom/sessionStorage/function/eval",
			baseUrl: "/dom/toxicdom/sessionStorage/function/eval",
			action: ACTION.SESSION_STORAGE,
		},
		{
			url: url + "/dom/toxicdom/sessionStorage/function/innerHtml",
			baseUrl: "/dom/toxicdom/sessionStorage/function/innerHtml",
			action: ACTION.SESSION_STORAGE,
		},
		{
			url: url + "/dom/toxicdom/sessionStorage/function/documentWrite",
			baseUrl: "/dom/toxicdom/sessionStorage/function/documentWrite",
			action: ACTION.SESSION_STORAGE,
		},
		{
			url: url + "/dom/toxicdom/sessionStorage/property/documentWrite",
			baseUrl: "/dom/toxicdom/sessionStorage/property/documentWrite",
			action: ACTION.SESSION_STORAGE,
		},
		{
			url: url + "/dom/toxicdom/external/sessionStorage/array/eval",
			baseUrl: "/dom/toxicdom/external/sessionStorage/array/eval",
			action: ACTION.SESSION_STORAGE,
		},
		{
			url: url + "/dom/toxicdom/external/sessionStorage/function/eval",
			baseUrl: "/dom/toxicdom/external/sessionStorage/function/eval",
			action: ACTION.SESSION_STORAGE,
		},
		{
			url: url + "/dom/toxicdom/external/sessionStorage/function/innerHtml",
			baseUrl: "/dom/toxicdom/external/sessionStorage/function/innerHtml",
			action: ACTION.SESSION_STORAGE,
		},
		{
			url: url + "/dom/toxicdom/external/sessionStorage/function/documentWrite",
			baseUrl: "/dom/toxicdom/external/sessionStorage/function/documentWrite",
			action: ACTION.SESSION_STORAGE,
		},
		{
			url: url + "/dom/toxicdom/external/sessionStorage/property/documentWrite",
			baseUrl: "/dom/toxicdom/external/sessionStorage/property/documentWrite",
			action: ACTION.SESSION_STORAGE,
		},
		{
			url: url + "/dom/toxicdom/postMessage/eval",
			baseUrl: "/dom/toxicdom/postMessage/eval",
			action: ACTION.POST_MESSAGE,
		},
		{
			url: url + "/dom/toxicdom/postMessage/innerHtml",
			baseUrl: "/dom/toxicdom/postMessage/innerHtml",
			action: ACTION.JSON_HTML_MESSAGE,
		},
		{
			url: url + "/dom/toxicdom/postMessage/documentWrite",
			baseUrl: "/dom/toxicdom/postMessage/documentWrite",
			action: ACTION.JSON_URL_MESSAGE,
		},
		{
			url: url + "/dom/toxicdom/postMessage/complexMessageDocumentWriteEval",
			baseUrl: "/dom/toxicdom/postMessage/complexMessageDocumentWriteEval",
			action: ACTION.COMPLEX_MESSAGE,
		},
		{
			url: url + "/urldom/location/hash/a.href#",
			baseUrl: "/urldom/location/hash/a.href#",
			action: ACTION.CLICK_A_TAG,
		},
		{
			url: url + "/urldom/location/hash/document.location#",
			baseUrl: "/urldom/location/hash/document.location#",
			action: ACTION.VISIT,
		},
		{
			url: url + "/urldom/location/hash/iframe.src#",
			baseUrl: "/urldom/location/hash/iframe.src#",
			action: ACTION.VISIT,
		},
		{
			url: url + "/urldom/location/hash/window.open#",
			baseUrl: "/urldom/location/hash/window.open#",
			action: ACTION.VISIT,
		},
		{
			url: url + "/urldom/location/search/svg.a?",
			baseUrl: "/urldom/location/search/svg.a?",
			action: ACTION.CLICK_A_TAG,
		},
		{
			url: url + "/dom/eventtriggering/document/inputTyping/eval",
			baseUrl: "/dom/eventtriggering/document/inputTyping/eval",
			action: ACTION.TYPING_EVENT,
		},
		{
			url: url + "/dom/eventtriggering/document/inputTyping/innerHtml",
			baseUrl: "/dom/eventtriggering/document/inputTyping/innerHtml",
			action: ACTION.TYPING_EVENT,
		},
		{
			url: url + "/dom/eventtriggering/document/inputTyping/documentWrite",
			baseUrl: "/dom/eventtriggering/document/inputTyping/documentWrite",
			action: ACTION.TYPING_EVENT,
		},
		{
			url: url + "/dom/toxicdom/window/name/eval",
			baseUrl: "/dom/toxicdom/window/name/eval",
			action: ACTION.WINDOW_NAME,
		},
		{
			url: url + "/dom/toxicdom/window/name/innerHtml",
			baseUrl: "/dom/toxicdom/window/name/innerHtml",
			action: ACTION.WINDOW_NAME,
		},
		{
			url: url + "/dom/toxicdom/window/name/documentWrite",
			baseUrl: "/dom/toxicdom/window/name/documentWrite",
			action: ACTION.WINDOW_NAME,
		},
		// The referer is set in the request, but document.referrer is empty so the payload will not work
		// https://github.com/puppeteer/puppeteer/issues/2831
		{
			url: url + "/dom/toxicdom/document/referrer/innerHtml",
			baseUrl: "/dom/toxicdom/document/referrer/innerHtml",
			action: ACTION.REFERER,
		},
		{
			url: url + "/dom/toxicdom/document/referrer/documentWrite",
			baseUrl: "/dom/toxicdom/document/referrer/documentWrite",
			action: ACTION.REFERER,
		},
		{
			url: url + "/dom/toxicdom/document/referrer/eval",
			baseUrl: "/dom/toxicdom/document/referrer/eval",
			action: ACTION.REFERER,
		},
		{
			url: url + "/urldom/location/search/area.href?",
			baseUrl: "/urldom/location/search/area.href?",
			action: ACTION.CLICK_AREA_TAG,
		},
		{
			url: url + "/reflected/parameter/form",
			baseUrl: "/reflected/parameter/form",
			action: ACTION.FORM_WITH_INPUT_Q,
		},
		{
			url: url + "/dom/eventtriggering/document/formSubmission/eval",
			baseUrl: "/dom/eventtriggering/document/formSubmission/eval",
			action: ACTION.FORM_WITH_INPUT_USER,
		},
		{
			url: url + "/dom/eventtriggering/document/formSubmission/innerHtml",
			baseUrl: "/dom/eventtriggering/document/formSubmission/innerHtml",
			action: ACTION.FORM_WITH_INPUT_USER,
		},
		{
			url: url + "/dom/eventtriggering/document/formSubmission/documentWrite",
			baseUrl: "/dom/eventtriggering/document/formSubmission/documentWrite",
			action: ACTION.FORM_WITH_INPUT_USER,
		},
		{
			url: url + "/urldom/location/hash/input.formaction#",
			baseUrl: "/urldom/location/hash/input.formaction#",
			action: ACTION.FORM_URL_PARAM,
		},
		{
			url: url + "/urldom/location/hash/form.action#",
			baseUrl: "/urldom/location/hash/form.action#",
			action: ACTION.FORM_URL_PARAM,
		},
		{
			url: url + "/address/location.hash/formaction#",
			baseUrl: "/address/location.hash/formaction#",
			action: ACTION.FORM_URL_PARAM,
		},
		{
			url: url + "/urldom/location/search/button.formaction?",
			baseUrl: "/urldom/location/search/button.formaction?",
			action: ACTION.FORM_URL_PARAM,
		},
	];
}

export function getActiveTestIds() {
	return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 31, 32, 33, 34, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 61, 64, 65, 66, 67, 68, 69, 71, 72, 74, 75, 76, 77, 78, 80, 82, 83, 84, 85, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 128, 129, 130, 131, 132, 133, 134, 148, 149, 150, 151, 152, 153, 154, 156, 157, 158, 159, 160];
}

export function getAllTests(): TestInformation[] {
	return [
        {
            "test_id": 1,
            "path": "/address/location.hash/assign#",
            "action": "VISIT",
            "category": "Address DOM XSS"
        },
        {
            "test_id": 2,
            "path": "/address/location.hash/eval#",
            "action": "VISIT",
            "category": "Address DOM XSS"
        },
        {
            "test_id": 3,
            "path": "/address/location.hash/replace#",
            "action": "VISIT",
            "category": "Address DOM XSS"
        },
        {
            "test_id": 4,
            "path": "/address/location.hash/setTimeout#",
            "action": "VISIT",
            "category": "Address DOM XSS"
        },
        {
            "test_id": 5,
            "path": "/address/location.hash/function#",
            "action": "VISIT",
            "category": "Address DOM XSS"
        },
        {
            "test_id": 6,
            "path": "/address/location.hash/onclickSetAttribute#",
            "action": "CLICK_DIV_TAG",
            "category": "Address DOM XSS"
        },
        {
            "test_id": 7,
            "path": "/address/location.hash/onclickAddEventListener#",
            "action": "CLICK_DIV_TAG",
            "category": "Address DOM XSS"
        },
        {
            "test_id": 8,
            "path": "/address/location.hash/jshref#",
            "action": "CLICK_A_TAG",
            "category": "Address DOM XSS"
        },
        {
            "test_id": 9,
            "path": "/address/location.hash/inlineevent#",
            "action": "CLICK_DIV_TAG",
            "category": "Address DOM XSS"
        },
        {
            "test_id": 10,
            "path": "/address/location.hash/formaction#",
            "action": "CLICK_INPUT_TAG",
            "category": "Address DOM XSS"
        },
        {
            "test_id": 31,
            "path": "/dom/toxicdom/document/cookie_set/eval",
            "action": "COOKIE",
            "category": "DOM XSS"
        },
        {
            "test_id": 32,
            "path": "/dom/toxicdom/document/cookie_set/innerHtml",
            "action": "COOKIE",
            "category": "DOM XSS"
        },
        {
            "test_id": 33,
            "path": "/dom/toxicdom/document/cookie_set/documentWrite",
            "action": "COOKIE",
            "category": "DOM XSS"
        },
        {
            "test_id": 34,
            "path": "/dom/toxicdom/document/cookie/eval",
            "action": "COOKIE2",
            "category": "DOM XSS"
        },
        {
            "test_id": 38,
            "path": "/dom/toxicdom/window/name/eval",
            "action": "WINDOW_NAME",
            "category": "DOM XSS"
        },
        {
            "test_id": 39,
            "path": "/dom/toxicdom/window/name/innerHtml",
            "action": "WINDOW_NAME",
            "category": "DOM XSS"
        },
        {
            "test_id": 40,
            "path": "/dom/toxicdom/window/name/documentWrite",
            "action": "WINDOW_NAME",
            "category": "DOM XSS"
        },
        {
            "test_id": 41,
            "path": "/dom/toxicdom/localStorage/array/eval",
            "action": "LOCAL_STORAGE",
            "category": "DOM XSS"
        },
        {
            "test_id": 42,
            "path": "/dom/toxicdom/localStorage/function/eval",
            "action": "LOCAL_STORAGE",
            "category": "DOM XSS"
        },
        {
            "test_id": 43,
            "path": "/dom/toxicdom/localStorage/function/innerHtml",
            "action": "LOCAL_STORAGE",
            "category": "DOM XSS"
        },
        {
            "test_id": 44,
            "path": "/dom/toxicdom/localStorage/function/documentWrite",
            "action": "LOCAL_STORAGE",
            "category": "DOM XSS"
        },
        {
            "test_id": 45,
            "path": "/dom/toxicdom/localStorage/property/documentWrite",
            "action": "LOCAL_STORAGE",
            "category": "DOM XSS"
        },
        {
            "test_id": 46,
            "path": "/dom/toxicdom/external/localStorage/array/eval",
            "action": "LOCAL_STORAGE",
            "category": "DOM XSS"
        },
        {
            "test_id": 47,
            "path": "/dom/toxicdom/external/localStorage/function/eval",
            "action": "LOCAL_STORAGE",
            "category": "DOM XSS"
        },
        {
            "test_id": 48,
            "path": "/dom/toxicdom/sessionStorage/function/innerHtml",
            "action": "SESSION_STORAGE",
            "category": "DOM XSS"
        },
        {
            "test_id": 49,
            "path": "/dom/toxicdom/sessionStorage/array/eval",
            "action": "SESSION_STORAGE",
            "category": "DOM XSS"
        },
        {
            "test_id": 50,
            "path": "/dom/toxicdom/sessionStorage/function/eval",
            "action": "SESSION_STORAGE",
            "category": "DOM XSS"
        },
        {
            "test_id": 51,
            "path": "/dom/toxicdom/external/sessionStorage/function/innerHtml",
            "action": "SESSION_STORAGE",
            "category": "DOM XSS"
        },
        {
            "test_id": 52,
            "path": "/dom/toxicdom/sessionStorage/function/documentWrite",
            "action": "SESSION_STORAGE",
            "category": "DOM XSS"
        },
        {
            "test_id": 53,
            "path": "/dom/toxicdom/sessionStorage/property/documentWrite",
            "action": "SESSION_STORAGE",
            "category": "DOM XSS"
        },
        {
            "test_id": 54,
            "path": "/dom/toxicdom/external/sessionStorage/array/eval",
            "action": "SESSION_STORAGE",
            "category": "DOM XSS"
        },
        {
            "test_id": 55,
            "path": "/dom/toxicdom/external/sessionStorage/function/eval",
            "action": "SESSION_STORAGE",
            "category": "DOM XSS"
        },
        {
            "test_id": 56,
            "path": "/dom/toxicdom/external/sessionStorage/function/documentWrite",
            "action": "SESSION_STORAGE",
            "category": "DOM XSS"
        },
        {
            "test_id": 57,
            "path": "/dom/toxicdom/external/sessionStorage/property/documentWrite",
            "action": "SESSION_STORAGE",
            "category": "DOM XSS"
        },
        {
            "test_id": 58,
            "path": "/dom/toxicdom/postMessage/eval",
            "action": "POST_MESSAGE",
            "category": "DOM XSS"
        },
        {
            "test_id": 59,
            "path": "/dom/toxicdom/postMessage/innerHtml",
            "action": "JSON_HTML_MESSAGE",
            "category": "DOM XSS"
        },
        {
            "test_id": 61,
            "path": "/dom/toxicdom/postMessage/complexMessageDocumentWriteEval",
            "action": "COMPLEX_MESSAGE",
            "category": "DOM XSS"
        },
        {
            "test_id": 64,
            "path": "/dom/eventtriggering/document/formSubmission/eval",
            "action": "FORM_WITH_INPUT",
            "category": "DOM XSS"
        },
        {
            "test_id": 65,
            "path": "/dom/eventtriggering/document/formSubmission/innerHtml",
            "action": "FORM_WITH_INPUT",
            "category": "DOM XSS"
        },
        {
            "test_id": 66,
            "path": "/dom/eventtriggering/document/formSubmission/documentWrite",
            "action": "FORM_WITH_INPUT",
            "category": "DOM XSS"
        },
        {
            "test_id": 67,
            "path": "/dom/eventtriggering/document/inputTyping/eval",
            "action": "TYPING_EVENT",
            "category": "DOM XSS"
        },
        {
            "test_id": 68,
            "path": "/dom/eventtriggering/document/inputTyping/innerHtml",
            "action": "TYPING_EVENT",
            "category": "DOM XSS"
        },
        {
            "test_id": 69,
            "path": "/dom/eventtriggering/document/inputTyping/documentWrite",
            "action": "TYPING_EVENT",
            "category": "DOM XSS"
        },
        {
            "test_id": 71,
            "path": "/dom/dompropagation#",
            "action": "VISIT",
            "category": "DOM XSS"
        },
        {
            "test_id": 72,
            "path": "/escape/serverside/escapeHtml/tagname?q=",
            "action": "VISIT",
            "category": "Escaped XSS"
        },
        {
            "test_id": 74,
            "path": "/escape/serverside/escapeHtml/attribute_unquoted?q=",
            "action": "CLICK_TAG_TAG",
            "category": "Escaped XSS"
        },
        {
            "test_id": 75,
            "path": "/escape/serverside/escapeHtml/attribute_singlequoted?q=",
            "action": "CLICK_TAG_TAG",
            "category": "Escaped XSS"
        },
        {
            "test_id": 76,
            "path": "/escape/serverside/escapeHtml/attribute_quoted?q=",
            "action": "CLICK_TAG_TAG",
            "category": "Escaped XSS"
        },
        {
            "test_id": 77,
            "path": "/escape/serverside/escapeHtml/attribute_name?q=",
            "action": "CLICK_TAG_TAG",
            "category": "Escaped XSS"
        },
        {
            "test_id": 78,
            "path": "/escape/serverside/escapeHtml/js_assignment?q=",
            "action": "VISIT",
            "category": "Escaped XSS"
        },
        {
            "test_id": 80,
            "path": "/escape/serverside/escapeHtml/js_eval?q=",
            "action": "VISIT",
            "category": "Escaped XSS"
        },
        {
            "test_id": 82,
            "path": "/escape/serverside/escapeHtml/js_quoted_string?q=",
            "action": "VISIT",
            "category": "Escaped XSS"
        },
        {
            "test_id": 83,
            "path": "/escape/serverside/escapeHtml/js_singlequoted_string?q=",
            "action": "VISIT",
            "category": "Escaped XSS"
        },
        {
            "test_id": 84,
            "path": "/escape/serverside/escapeHtml/js_slashquoted_string?q=",
            "action": "VISIT",
            "category": "Escaped XSS"
        },
        {
            "test_id": 85,
            "path": "/escape/serverside/escapeHtml/js_comment?q=",
            "action": "VISIT",
            "category": "Escaped XSS"
        },
        {
            "test_id": 89,
            "path": "/escape/serverside/escapeHtml/css_import?q=",
            "action": "VISIT",
            "category": "Escaped XSS"
        },
        {
            "test_id": 90,
            "path": "/escape/js/escape?q=",
            "action": "VISIT",
            "category": "Escaped XSS"
        },
        {
            "test_id": 91,
            "path": "/escape/js/encodeURIComponent?q=",
            "action": "VISIT",
            "category": "Escaped XSS"
        },
        {
            "test_id": 92,
            "path": "/escape/js/html_escape?q=",
            "action": "VISIT",
            "category": "Escaped XSS"
        },
        {
            "test_id": 93,
            "path": "/reflected/parameter/body?q=",
            "action": "VISIT",
            "category": "Reflected XSS"
        },
        {
            "test_id": 94,
            "path": "/reflected/parameter/head?q=",
            "action": "VISIT",
            "category": "Reflected XSS"
        },
        {
            "test_id": 95,
            "path": "/reflected/parameter/title?q=",
            "action": "VISIT",
            "category": "Reflected XSS"
        },
        {
            "test_id": 96,
            "path": "/reflected/parameter/body_comment?q=",
            "action": "VISIT",
            "category": "Reflected XSS"
        },
        {
            "test_id": 97,
            "path": "/reflected/parameter/tagname?q=",
            "action": "VISIT",
            "category": "Reflected XSS"
        },
        {
            "test_id": 98,
            "path": "/reflected/parameter/attribute_unquoted?q=",
            "action": "VISIT",
            "category": "Reflected XSS"
        },
        {
            "test_id": 99,
            "path": "/reflected/parameter/attribute_singlequoted?q=",
            "action": "VISIT",
            "category": "Reflected XSS"
        },
        {
            "test_id": 100,
            "path": "/reflected/parameter/attribute_quoted?q=",
            "action": "VISIT",
            "category": "Reflected XSS"
        },
        {
            "test_id": 101,
            "path": "/reflected/parameter/attribute_name?q=",
            "action": "VISIT",
            "category": "Reflected XSS"
        },
        {
            "test_id": 102,
            "path": "/reflected/parameter/body/400?q=",
            "action": "VISIT",
            "category": "Reflected XSS"
        },
        {
            "test_id": 103,
            "path": "/reflected/parameter/body/401?q=",
            "action": "VISIT",
            "category": "Reflected XSS"
        },
        {
            "test_id": 104,
            "path": "/reflected/parameter/body/403?q=",
            "action": "VISIT",
            "category": "Reflected XSS"
        },
        {
            "test_id": 105,
            "path": "/reflected/parameter/body/404?q=",
            "action": "VISIT",
            "category": "Reflected XSS"
        },
        {
            "test_id": 106,
            "path": "/reflected/parameter/body/500?q=",
            "action": "VISIT",
            "category": "Reflected XSS"
        },
        {
            "test_id": 107,
            "path": "/reflected/parameter/iframe_attribute_value?q=",
            "action": "VISIT",
            "category": "Reflected XSS"
        },
        {
            "test_id": 108,
            "path": "/reflected/parameter/iframe_srcdoc?q=",
            "action": "VISIT",
            "category": "Reflected XSS"
        },
        {
            "test_id": 109,
            "path": "/reflected/parameter/textarea?q=",
            "action": "VISIT",
            "category": "Reflected XSS"
        },
        {
            "test_id": 110,
            "path": "/reflected/parameter/textarea_attribute_value?q=",
            "action": "VISIT",
            "category": "Reflected XSS"
        },
        {
            "test_id": 111,
            "path": "/reflected/parameter/noscript?q=",
            "action": "VISIT",
            "category": "Reflected XSS"
        },
        {
            "test_id": 112,
            "path": "/reflected/parameter/style_attribute_value?q=",
            "action": "VISIT",
            "category": "Reflected XSS"
        },
        {
            "test_id": 113,
            "path": "/reflected/parameter/css_style?q=",
            "action": "VISIT",
            "category": "Reflected XSS"
        },
        {
            "test_id": 114,
            "path": "/reflected/parameter/css_style_value?q=",
            "action": "VISIT",
            "category": "Reflected XSS"
        },
        {
            "test_id": 115,
            "path": "/reflected/parameter/css_style_font_value?q=",
            "action": "VISIT",
            "category": "Reflected XSS"
        },
        {
            "test_id": 116,
            "path": "/reflected/escapedparameter/js_eventhandler_unquoted/UNQUOTED_ATTRIBUTE?q=",
            "action": "CLICK_DIV_TAG",
            "category": "Reflected XSS"
        },
        {
            "test_id": 117,
            "path": "/reflected/escapedparameter/js_eventhandler_quoted/DOUBLE_QUOTED_ATTRIBUTE?q=",
            "action": "CLICK_DIV_TAG",
            "category": "Reflected XSS"
        },
        {
            "test_id": 118,
            "path": "/reflected/escapedparameter/js_eventhandler_singlequoted/SINGLE_QUOTED_ATTRIBUTE?q=",
            "action": "CLICK_DIV_TAG",
            "category": "Reflected XSS"
        },
        {
            "test_id": 119,
            "path": "/reflected/parameter/js_assignment?q=",
            "action": "VISIT",
            "category": "Reflected XSS"
        },
        {
            "test_id": 120,
            "path": "/reflected/parameter/js_eval?q=",
            "action": "VISIT",
            "category": "Reflected XSS"
        },
        {
            "test_id": 121,
            "path": "/reflected/parameter/js_quoted_string?q=",
            "action": "VISIT",
            "category": "Reflected XSS"
        },
        {
            "test_id": 122,
            "path": "/reflected/parameter/js_singlequoted_string?q=",
            "action": "VISIT",
            "category": "Reflected XSS"
        },
        {
            "test_id": 123,
            "path": "/reflected/parameter/js_slashquoted_string?q=",
            "action": "VISIT",
            "category": "Reflected XSS"
        },
        {
            "test_id": 124,
            "path": "/reflected/parameter/js_comment?q=",
            "action": "VISIT",
            "category": "Reflected XSS"
        },
        {
            "test_id": 125,
            "path": "/reflected/parameter/attribute_script?q=",
            "action": "VISIT",
            "category": "Reflected XSS"
        },
        {
            "test_id": 128,
            "path": "/reflected/parameter/json?q=",
            "action": "VISIT",
            "category": "Reflected XSS"
        },
        {
            "test_id": 129,
            "path": "/reflected/parameter/form",
            "action": "FORM_WITH_INPUT",
            "category": "Reflected XSS"
        },
        {
            "test_id": 130,
            "path": "/reflected/filteredcharsets/body/SpaceDoubleQuoteSlashEquals?q=",
            "action": "VISIT",
            "category": "Reflected XSS"
        },
        {
            "test_id": 131,
            "path": "/reflected/filteredcharsets/attribute_unquoted/DoubleQuoteSinglequote?q=",
            "action": "CLICK_TAG_TAG",
            "category": "Reflected XSS"
        },
        {
            "test_id": 132,
            "path": "/reflected/filteredstrings/body/caseSensitive/script?q=",
            "action": "VISIT",
            "category": "Reflected XSS"
        },
        {
            "test_id": 133,
            "path": "/reflected/filteredstrings/body/caseSensitive/SCRIPT?q=",
            "action": "VISIT",
            "category": "Reflected XSS"
        },
        {
            "test_id": 134,
            "path": "/reflected/filteredstrings/body/caseInsensitive/script?q=",
            "action": "VISIT",
            "category": "Reflected XSS"
        },
        {
            "test_id": 148,
            "path": "/tags/expression?q=",
            "action": "VISIT",
            "category": "Tag based XSS"
        },
        {
            "test_id": 149,
            "path": "/tags/multiline?q=",
            "action": "VISIT",
            "category": "Tag based XSS"
        },
        {
            "test_id": 150,
            "path": "/urldom/location/hash/a.href#",
            "action": "CLICK_A_TAG",
            "category": "URL-based DOM XSS"
        },
        {
            "test_id": 151,
            "path": "/urldom/location/hash/document.location#",
            "action": "VISIT",
            "category": "URL-based DOM XSS"
        },
        {
            "test_id": 152,
            "path": "/urldom/location/hash/form.action#",
            "action": "FORM_URL_PARAM",
            "category": "URL-based DOM XSS"
        },
        {
            "test_id": 153,
            "path": "/urldom/location/hash/iframe.src#",
            "action": "VISIT",
            "category": "URL-based DOM XSS"
        },
        {
            "test_id": 154,
            "path": "/urldom/location/hash/input.formaction#",
            "action": "FORM_URL_PARAM",
            "category": "URL-based DOM XSS"
        },
        {
            "test_id": 156,
            "path": "/urldom/location/search/area.href?",
            "action": "CLICK_AREA_TAG",
            "category": "URL-based DOM XSS"
        },
        {
            "test_id": 157,
            "path": "/urldom/location/search/svg.a?",
            "action": "CLICK_A_TAG",
            "category": "URL-based DOM XSS"
        },
        {
            "test_id": 158,
            "path": "/urldom/location/search/button.formaction?",
            "action": "CLICK_BUTTON",
            "category": "URL-based DOM XSS"
        },
        {
            "test_id": 159,
            "path": "/urldom/location/search/location.assign?",
            "action": "VISIT",
            "category": "URL-based DOM XSS"
        },
        {
            "test_id": 160,
            "path": "/urldom/location/search/frame.src?",
            "action": "VISIT",
            "category": "URL-based DOM XSS"
        }
    ]
}