document.addEventListener("DOMContentLoaded", () => {
  const dateInput = document.getElementById("journal-date");
  const entryInput = document.getElementById("journal-entry");
  const generateButton = document.getElementById("generate-entry");

  const generatedSection = document.getElementById("generated-section");
  const generatedFilename = document.getElementById("generated-filename");
  const generatedOutput = document.getElementById("generated-output");

  const copyEntryButton = document.getElementById("copy-entry");
  const copyFilenameButton = document.getElementById("copy-filename");
  const copyStatus = document.getElementById("copy-status");

  // Fill today's date automatically.
  if (dateInput && !dateInput.value) {
    const today = new Date();
    const localDate = new Date(
      today.getTime() - today.getTimezoneOffset() * 60000
    )
      .toISOString()
      .split("T")[0];

    dateInput.value = localDate;
  }

  function buildJournalEntry() {
    const date = dateInput.value.trim();
    const entry = entryInput.value.trim();

    if (!date) {
      alert("Choose a date first.");
      dateInput.focus();
      return null;
    }

    if (!entry) {
      alert("Write something in the journal entry first.");
      entryInput.focus();
      return null;
    }

    const filename = `${date}.md`;

    const content = `---
date: ${date}
---

${entry}
`;

    return {
      filename,
      content
    };
  }

  generateButton?.addEventListener("click", () => {
    const journalFile = buildJournalEntry();

    if (!journalFile) {
      return;
    }

    generatedFilename.textContent = journalFile.filename;
    generatedOutput.textContent = journalFile.content;

    generatedSection.hidden = false;
    copyStatus.textContent = "";

    generatedSection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });

  copyEntryButton?.addEventListener("click", async () => {
    const content = generatedOutput.textContent;

    if (!content) {
      return;
    }

    try {
      await navigator.clipboard.writeText(content);
      copyStatus.textContent = "Entry copied.";
    } catch (error) {
      copyStatus.textContent = "Could not copy automatically.";
      console.error(error);
    }
  });

  copyFilenameButton?.addEventListener("click", async () => {
    const filename = generatedFilename.textContent;

    if (!filename) {
      return;
    }

    try {
      await navigator.clipboard.writeText(filename);
      copyStatus.textContent = "Filename copied.";
    } catch (error) {
      copyStatus.textContent = "Could not copy automatically.";
      console.error(error);
    }
  });
});
