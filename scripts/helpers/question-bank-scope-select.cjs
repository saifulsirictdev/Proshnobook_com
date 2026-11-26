async function chooseBankScopeField(root, label, value) {
  const select = root.getByLabel(label, { exact: true });
  const exists = await select
    .locator("option")
    .evaluateAll(
      (options, value) => options.some((option) => option.value === value),
      value,
    );
  if (exists) await select.selectOption(value);
  else {
    await select.selectOption("__custom__");
    await root.getByLabel(label + " নতুন নাম", { exact: true }).fill(value);
  }
}
module.exports = { chooseBankScopeField };
