const help = `
  Usage: npm init @capacitor/plugin [<path>] [options]

  Options:

    --name <name> ............. npm package name (e.g. "capacitor-plugin-example")
    --package-id <id> ......... Unique plugin ID in reverse-DNS notation (e.g. "com.mycompany.plugins.example")
    --class-name <name> ....... Plugin class name (e.g. "Example")
    --repo <url> .............. URL to git repository (e.g. "https://github.com/example/repo")
    --author <author> ......... Author name and email (e.g. "Name <name@example.com>")
    --license <id> ............ SPDX License ID (e.g. "MIT")
    --description <text> ...... Short description of plugin features
    --android-lang ............ Language for Android plugin development (either "kotlin" or "java")

    -h, --help ................ Print help, then quit
    --verbose ................. Print verbose output to stderr
`;

export const run = (): void => {
  process.stdout.write(help);
};
