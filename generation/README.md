# generation/

*Listing the relevant files only.*

	└── generation
		├── config.ts
		├── minimizer.ts
		├── polytest.ts
		└── runner
		|   ├── greedyrunner.ts
		|   ├── mctsRunner.ts
		|   └── rlrunner.ts
	    ├── tester
	    │   └── google_tests.ts
	    └── tree
	        └── tokens.ts

## RUN LOCALLY

Alternatively to Docker, a local setup is possible. NodeJS and ts-node are required.
You may need extra steps to correctly install Puppeteer and the corresponding browsers.
Therefore, it may be easier to use our Dockerfile.

### INSTALL DEPENDENCIES

```BASH
$ cd testbed && npm install && cd -
$ cd generation && npm install && cd -
$ cd polytest && npm install && cd -

$ mkdir data data/out
```

### START THE LOCAL TESTBED

```BASH
$ cd testbed && ts-node server.ts
```

### START MCTS

```BASH
$ cd generation && RUN_IDENTIFIER=my-generation ts-node main.ts
```

### RUN MINIMIZATION

Suppose, you saved the file at /data/example.json, you can use the minimizer in the following way:

```BASH
$ mkdir /data/out
$ cd generation && ts-node minimizer.ts /data/example.json /data/out
```

The final minimized file will be written to `/data/out/example-final.json`.

---

## FOR THE INTERESTED

### MCTS
A short tutorial about the MCTS algorithm can be found [here](https://www.analyticsvidhya.com/blog/2019/01/monte-carlo-tree-search-introduction-algorithm-deepmind-alphago/).

Using the `--runnerType` parameter, you can change the generation method to `MCTS`, `RL`, `Random` or `Greedy`.

### POLYGLOT CONFIGURATION

- The polyglot is generated step by step. In each step a value from EXPLOIT, LITERALBREAKER or HTMLBREAKER (see [tokens.ts](./tree/tokens.ts)) is selected and appended
- We don't have any information about the optimal Polyglot length, so the MCTS algorithm takes a parameter `maxTokens` or `maxPayloadLength` to decide when a Polyglot is finished
- [tokens.ts](./tree/tokens.ts) defines the tokens a polyglot is assembled from. The file can easily extended by defining an additional tokenset and passing it to the generation process via `--tokenType` flag. Polyglots are designed to load a remote script, e.g., via `import` or `src` attribute. This remote script is defined in [config.ts](./config.ts) (`exploit_url`) and is currently configured to load a locally hosted [xss.js](../testbed/xss.js).
- Note that the local testbed has to be running before the generation can be started. Also, it is checked if the defined `exploit_url` is reachable.

### PARAMETERS

The most relevant configuration parameters are described here. Refer to [main.ts](./main.ts) for further information.

| Parameter                | Description                                                                      | Default    |
| ------------------------ | -------------------------------------------------------------------------------- | ---------- |
| `--runnerType`           | Which kind of runner to run. See examples below for configuration.               | "MCTS"     |
| `--tokenType`            | Defines the type of tokens defined in token.ts                                   | XSS_TOKENS |
| `--maxGenerationTries`   | Defines how many polyglots are created in an attempt to cover the entire testbed | 10         |
| `--simulationsPerAction` | Defines how many simulations are done from each start-'root' node                | "infinite" |
| `--maxRootDepth`         | Defines the maximum depth of the start-'root' node                               | 12         |
| `--maxPayloadLength`     | Define the maximum payload length                                                | 400        |
| `--saveFrequency`        | Defines after how many simulations output is saved                               | 50         |

#### RUN ALTERNATIVE ALGORITHMS

Greedy and RL use a budget for testbed calls. For MCTS and Random the amount of testbed calls is defined by the chosen parameters, instead. For example, a `maxRootDeph` of 12 with 1,000 `simulationsPerAction` means that one polyglot is generated using 12,000 testbed calls. With 10 `maxGenerationTries`, a total of 120,000 testbed calls is conducted to generate 10 polyglots aiming to cover the small testbed.

Using the same budget of testbed calls would result in the following start commands:

```BASH
# Greedy
main.ts --runnerType Greedy --tokenType XSS_TOKENS --rlGreedyBudget=12000 --maxRootDepth=1 --maxGenerationTries=10
```

```BASH
# Q-learning
main.ts --runnerType RL --tokenType XSS_TOKENS --rlGreedyBudget=12000 --maxRootDepth=1 --maxGenerationTries=10
```

```BASH
# Random
main.ts --runnerType Random --tokenType XSS_TOKENS --simulationsPerAction=12000 --maxRootDepth=1 --maxGenerationTries=10
```

*Random does not require the budget and is instead configured similar to MCTS.*

### SEED

[Seedrandom](https://github.com/davidbau/seedrandom) is used for seeding the PRNG. All Polyglots were generated without a seed, however, it might be useful to set a seed for deterministic experiments. The seed must be set in the [runnermanager.ts](./runner/runnermanager.ts) file:

```
var seedrandom = require("seedrandom");
var rng = seedrandom("1337");
```

#### MCTS ALGORITHM

- Selection:
    - Select node with highest UCB value
- Expand:
    - Expand tree by appending all possible states from the leaf node
- Simulate:
    - Pick random child node
    - Simulate randomized game
- Backpropagation:
    - Update score of tree

Upper Confidence Bound (UCB):
![UCB](http://www.sciweavers.org/tex2img.php?eq=UCB%3D%5Cfrac%7Bw_i%7D%7Bn_i%7D%2Bc%5Csqrt%7B%5Cfrac%7Bln%28t%29%7D%7Bn_i%7D%7D&bc=White&fc=Black&im=jpg&fs=12&ff=arev&edit=0)

- w_i = number of wins after i-th move
- n_i = number of simulations after i-th move
- c = exploration parameter (theoretically equal to \sqrt{2}
- t = total number of simulations for the parent node

### DIFFERENCES BETWEEN CLASSIC MCTS AND OUR APPROACH

- Termination condition:
    - Polyglot reached maximum score, i.e., it works on all test cases
    - Or we reached the maximum number of tokens
- 1-Player Setting:
    - In our setting we perform all the actions during the simulation step. Sometimes we generate a new best Polyglot during the simulation step. There is no reason to discard this Polyglot, since we are only interested in good Polyglots.
- Polyglot-Set:
    - We've reached a point where we can't pass all tests with a single Polyglot, therefore we look for a small set of Polyglots to pass all tests
    - In the first iteration we look for the best Polyglot to pass all tests
    - During the second iteration we consider only the failed tests from the previous iteration and look for the best Polyglot for these remaining tests
    - The steps repeated until we passed all tests
    - This leads to more specialized Polyglots after a few iterations. The first Polyglot might pass 15 tests whereas the last Polyglot might only pass a single test case

## Google Firing Range

This testbed covers most cases of the following sections from the [Google Firing Range](https://public-firing-range.appspot.com/)

- Address DOM XSS
- DOM XSS
- Escaped XSS
- Reflected XSS
- Remote inclusion XSS
- URL-based DOM XSS

The actual tests can be found in [google_tests.ts](./tester/google_tests.ts).
