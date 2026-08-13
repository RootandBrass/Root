const { app } = require("@azure/functions");

app.http("save-journal", {
  methods: ["POST"],
  authLevel: "anonymous",

  handler: async (request, context) => {
    try {
      const body = await request.json();

      const { filename, content } = body;

      if (!filename || !content) {
        return {
          status: 400,
          jsonBody: {
            success: false,
            message: "Filename and content are required."
          }
        };
      }

      const token = process.env.GITHUB_TOKEN_ROOTANDBRASS;

      if (!token) {
        context.error("GitHub token is not configured.");

        return {
          status: 500,
          jsonBody: {
            success: false,
            message: "Server configuration is incomplete."
          }
        };
      }

      const safeFilename = filename.replace(/[^0-9A-Za-z._-]/g, "");

      const path = `journal/entries/${safeFilename}`;

      const githubUrl =
        `https://api.github.com/repos/RootandBrass/Root/contents/${path}`;

      const response = await fetch(githubUrl, {
        method: "PUT",

        headers: {
          "Accept": "application/vnd.github+json",
          "Authorization": `Bearer ${token}`,
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "Root-and-Brass-Workbench"
        },

        body: JSON.stringify({
          message: `Add journal entry ${safeFilename}`,
          content: Buffer.from(content, "utf8").toString("base64"),
          branch: "main"
        })
      });

      const result = await response.json();

      if (!response.ok) {
        context.error(
          `GitHub returned ${response.status}: ${JSON.stringify(result)}`
        );

        return {
          status: response.status,
          jsonBody: {
            success: false,
            message:
              result.message ||
              "GitHub could not save the journal entry."
          }
        };
      }

      return {
        status: 201,
        jsonBody: {
          success: true,
          filename: safeFilename,
          path,
          message: "Journal entry saved."
        }
      };
    } catch (error) {
      context.error(error);

      return {
        status: 500,
        jsonBody: {
          success: false,
          message: "Something went wrong while saving the journal entry."
        }
      };
    }
  }
});
