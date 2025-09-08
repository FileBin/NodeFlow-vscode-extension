import { Message } from 'shared/models/message'

export function postMessage(message: Message) {
    // @ts-ignore
    vscode.postMessage(message)
}

export function resourceUrl(url: string) {
    // @ts-ignore
    const webviewRoot = __webviewRoot__ as string

    // eslint-disable-next-line eqeqeq
    if (webviewRoot == null) {
      return url;
    }
    
    // @ts-ignore
    return join(webviewRoot, url);
}

function join() {
  // Split the inputs into a list of path commands.
  let args = arguments;
  let parts: string[] = [];
  let [protocol, other] = args[0].split("://") as string[];

  // eslint-disable-next-line eqeqeq
  if(protocol != null) {
    protocol = protocol + "://";
    args[0] = other;
  }
  for (var i = 0, l = args.length; i < l; i++) {

    parts = parts.concat(args[i].split("/"));
  }
  // Interpret the path commands to get the new resolved path.
  var newParts = [];
  for (i = 0, l = parts.length; i < l; i++) {
    var part = parts[i];
    // Remove leading and trailing slashes
    // Also remove "." segments
    if (!part || part === ".") continue;
    // Interpret ".." to pop the last segment
    if (part === "..") newParts.pop();
    // Push new path segments.
    else newParts.push(part);
  }
  // Preserve the initial slash if there was one.
  if (parts[0] === "") newParts.unshift("");
  // Turn back into a single string path.

  let result = newParts.join("/") || (newParts.length ? "/" : ".");

  // eslint-disable-next-line eqeqeq
  if(protocol != null) {
    result = protocol + result;
  }
  return result;
}
