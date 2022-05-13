import { SettingSchemaDesc } from "@logseq/libs/dist/LSPlugin";

export const callSettings = () => {
  const settings: SettingSchemaDesc[] = [
    {
      key: "server",
      type: "string",
      default: "",
      description:
        "If you are using a local plantuml server, indicate the url that plantuml is running on. If you want to use https://www.plantuml.com/plantuml, then leave this field blank.",
      title: "PlantUML url",
    },
  ];

  logseq.useSettingsSchema(settings);
};
