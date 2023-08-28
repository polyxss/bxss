# testbed/

## Structure

*Listing the relevant files only.*

	└── testbed
		├── config.ts
		├── server.ts
		└── xss.js

Local, fast XSS testbed featuring a collection of different common XSS contexts.

## Usage

You just have to start the testing server.

`$ ts-node server.js`

It will be reachable at http://localhost:8080 or http://127.0.0.1:8080.
The root page lists all available tests.
