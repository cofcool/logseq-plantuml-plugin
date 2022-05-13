import "@logseq/libs";
import { callSettings } from "./callSettings";
import { render } from "./convert";

const uniqueIdentifier = () =>
  Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "");

const main = () => {
  console.log("logseq-plantuml-plugin loaded");

  callSettings();

  logseq.Editor.registerSlashCommand("Draw plantuml diagram", async () => {
    await logseq.Editor.insertAtEditingCursor(
      `{{renderer :plantuml_${uniqueIdentifier()}}}`
    );

    const currBlock = await logseq.Editor.getCurrentBlock();

    await logseq.Editor.insertBlock(
      currBlock.uuid,
      `\`\`\`plantuml 
\`\`\``,
      {
        sibling: false,
        before: false,
      }
    );
  });

  logseq.App.onMacroRendererSlotted(async ({ slot, payload }) => {
    const [type, colour] = payload.arguments;
    const id = type.split("_")[1]?.trim();
    const plantumlId = `plantuml_${id}`;

    if (!type.startsWith(":plantuml_")) return;

    const dataBlock = await logseq.Editor.getBlock(payload.uuid, {
      includeChildren: true,
    });

    const plantumlUUID = dataBlock.children[0]["uuid"];

    logseq.provideModel({
      async show() {
        render(type, payload, colour, plantumlUUID);
      },
    });

    logseq.provideStyle(`
      .renderBtn {
        border: 1px solid black;
        border-radius: 8px;
        padding: 3px;
        font-size: 80%;
        background-color: white;
        color: black;
      }

      .renderBtn:hover {
        background-color: black;
        color: white;
      }
    `);

    logseq.provideUI({
      key: `${plantumlId}`,
      slot,
      reset: true,
      template: `<button data-on-click="show" class="renderBtn">Render</button>`,
    });
  });
};

logseq.ready(main).catch(console.error);
