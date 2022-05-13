import { BlockUUID } from "@logseq/libs/dist/LSPlugin.user";
import { compress } from "./util";

export const render = async (
  type: string,
  payload: { uuid: string },
  colour: string,
  plantumlUUID: BlockUUID
) => {
  await logseq.Editor.editBlock(payload.uuid);
  await logseq.Editor.exitEditingMode();

  const plantumlBlock = await logseq.Editor.getBlock(plantumlUUID);
  const matchData = plantumlBlock.content.match(/```plantuml(.|\n)*?```/gm);

  let toDecode = matchData[0];

  if (logseq.settings.config) {
    const initStr = `\n%%{init: {'theme': '${logseq.settings.config.theme}'}}%%`;
    toDecode = toDecode.slice(0, 10) + initStr + toDecode.slice(10);
  }

  toDecode = toDecode.replace("```plantuml", "").replace("```", "");

  toDecode = toDecode.replace("\n", " ");

  const jsonString = compress(toDecode);

  const renderBlock = async (str: string) => {
    await logseq.Editor.updateBlock(
      payload.uuid,
      `${str}
{{renderer ${type}}}`
    );
  };

  const handleEvent = async () => {
    const handleUrl = () => {
      const { server } = logseq.settings;
      if (server) {
        return server;
      } else {
        return `https://www.plantuml.com/plantuml`;
      }
    };

    renderBlock(`<img src="${handleUrl()}/png/${jsonString}" />`);
  };

  const handleError = () => {
    renderBlock(
      "<p>There is an error with your plantuml syntax. Please rectify and render again.</p>"
    );
  };

  const image = new Image();
  image.onload = handleEvent;
  image.onerror = handleError;
  image.src = `https://www.plantuml.com/plantuml/png/${jsonString}`;
};
