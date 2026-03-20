class LlmReporter {
  constructor() {
    this.results = [];
  }

  bold(value) {
    return `\u001b[1m${value}\u001b[22m`;
  }

  onBegin(config, suite) {
    const testCount = suite.allTests().length;
    console.log("");
    console.log(this.bold(`Running ${testCount} LLM evaluation tests`));
    console.log("");
  }

  onTestEnd(test, result) {
    const title = test.title;

    this.results.push({
      title,
      status: result.status,
      error: result.errors[0]?.message || null
    });

    if (result.status === "passed") {
      console.log(`${this.bold("PASS")} ${title}`);
      return;
    }

    if (result.status === "failed") {
      console.log("");
      console.log(`${this.bold("FAIL")} ${this.bold(title)}`);
      console.log("");

      if (result.errors[0]?.message) {
        console.log(result.errors[0].message.replace(/^Error:\s*/, ""));
      }

      console.log("");

      return;
    }

    console.log(`${result.status.toUpperCase()} ${title}`);
  }

  onEnd() {
    const total = this.results.length;
    const passed = this.results.filter((result) => result.status === "passed").length;
    const failed = this.results.filter((result) => result.status === "failed").length;
    const skipped = this.results.filter((result) => result.status === "skipped").length;

    console.log("");
    console.log(this.bold("Summary"));
    console.log(`- total: ${total}`);
    console.log(`- passed: ${passed}`);
    console.log(`- failed: ${failed}`);

    if (skipped > 0) {
      console.log(`- skipped: ${skipped}`);
    }
  }
}

module.exports = LlmReporter;
