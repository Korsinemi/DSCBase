import { createRestManager } from "@discordeno/rest";
import { AeonaBot } from "../extras/index.js";
import { BASE_URL } from "discordeno";
import createRestManagerOld from "./createRest.js";

const setupRest = async (bot: AeonaBot, DISCORD_TOKEN: string) => {
  const rest = createRestManager({
    token: DISCORD_TOKEN,
  });

  bot.rest.runMethod = async (
    r,
    method,
    route,
    body,
    options
  ): Promise<any> => {
    const result = await rest
      .makeRequest(
        method,
        `${BASE_URL}/v${rest.version}${route}`,
        body,
        options
      )
      .catch((e) => {
        if (e instanceof Error) {
          if (e.message.includes("[404]")) return e;
          // eslint-disable-next-line no-console
          return e;
        }
        console.log(`${BASE_URL}/v${rest.version}${route}`);
        console.log(JSON.stringify(body));
        console.error(JSON.stringify(e));
        return e;
      });
    return result;
  };
  bot.rest.sendRequest = async (r, options): Promise<any> => {
    const result = await rest
      .makeRequest(
        options.method,
        options.url.startsWith(BASE_URL)
          ? options.url
          : `${BASE_URL}/v${rest.version}/${options.url}`,
        JSON.parse(JSON.stringify(options.payload.body))
      )
      .catch((e) => {
        if (e instanceof Error) {
          if (e.message.includes("[404]")) return e;
          // eslint-disable-next-line no-console
          return e;
        }
        console.log(`${options.url}`);
        console.log(JSON.parse(JSON.stringify(options.payload.body)));
        console.error(JSON.stringify(e));
        return e;
      });
    return result;
  };

  //set interval for 10 minutes
  setInterval(async () => {
    bot.rest = createRestManagerOld({
      token: DISCORD_TOKEN,
      runMethod(r, method, route, body, options): Promise<any> {
        return rest
          .makeRequest(
            method,
            `${BASE_URL}/v${rest.version}${route}`,
            body,
            options
          )
          .catch((e) => {
            if (e instanceof Error) {
              if (e.message.includes("[404]")) return e;
              // eslint-disable-next-line no-console
              return e;
            }
            console.log(`${BASE_URL}/v${rest.version}${route}`);
            console.log(JSON.stringify(body));
            console.error(JSON.stringify(e));
            return e;
          });
      },
      sendRequest(r, options): Promise<any> {
        const result = await rest
          .makeRequest(
            options.method,
            options.url.startsWith(BASE_URL)
              ? options.url
              : `${BASE_URL}/v${rest.version}/${options.url}`,
            JSON.parse(JSON.stringify(options.payload.body))
          )
          .catch((e) => {
            if (e instanceof Error) {
              if (e.message.includes("[404]")) return e;
              // eslint-disable-next-line no-console
              return e;
            }
            console.log(`${options.url}`);
            console.log(JSON.parse(JSON.stringify(options.payload.body)));
            console.error(JSON.stringify(e));
            return e;
          });
        return result;
      },
    });
  }, 2 * 60 * 1000);
};

export { setupRest };
