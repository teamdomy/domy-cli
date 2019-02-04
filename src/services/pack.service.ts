import { join, resolve } from "path";
import { FileService } from "./file.service";
import { spawn } from "child_process";

export class PackService {

  constructor(
    private fileService = new FileService()
  ) {

  }

  /**
   * Compiles the project
   *
   * @return {void}
   */
  public build(): void {

    const options = {
      cwd: process.cwd()
    };

    const pathway = resolve(__dirname, "..", "node_modules/@stencil/core/bin/stencil");
    const compiler = spawn("node", [pathway, "build", "--docs"], options);

    compiler.stdout.on("data", (data) => {
      console.info(data);
    });

    compiler.stderr.on("data", (data) => {
      console.error(data);
    });

    compiler.on("close", (code) => {
      console.info("Compiler closed");
    });
  }

  /**
   * Adds component name and version to package.json
   *
   * @param {string} component
   * @param {string} release
   * @return {Promise<boolean>}
   */
  public update(component: string, release: string): Promise<boolean> {
    if (component !== undefined) {

      const base = join(this.fileService.grub(), "package.json");
      const version = release ? release : "latest";


      this.fileService.read(base)
        .then(data => JSON.parse(data))
        .then(config => {
          if (!config.hasOwnProperty("webcomponents")) {
            config["webcomponents"] = {};
          }

          config["webcomponents"][component] = version;

          return this.fileService.write(base, JSON.stringify(config, null, 2));
        });

    } else {
      return Promise.resolve(true);
    }
  }

  /**
   * Reads webcomponent list from package.json
   *
   * @param {string} component
   * @param {string} release
   * @return {Promise<any>}
   */
  public read(component: string, release: string) {
    if (component !== undefined) {
      const version = release ? release : "latest";
      const response = {};
      response[component] = version;
      return Promise.resolve(response);
    } else {

      const base = join(this.fileService.grub(), "package.json");

      return this.fileService.read(base)
        .then(data => JSON.parse(data))
        .then(config => {
          if (config.hasOwnProperty("webcomponents")) {
            return config["webcomponents"];
          } else {
            return {};
          }
        });
    }
  }
}