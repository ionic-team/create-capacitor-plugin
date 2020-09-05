# Create Capacitor Plugin

Generate a new Capacitor plugin.

> ### :rotating_light: This is for Capacitor 3, which is in active development :rotating_light:
>
> To create Capacitor 2 plugins, use `npx @capacitor/cli plugin:generate`. Follow Capacitor 3 development in [this issue](https://github.com/ionic-team/capacitor/issues/3133).

## Usage

```
npm init @capacitor/plugin -- [<path>] [options]
```

:memo: `npm init <pkg>` requires npm 6+

You can also try the following methods to use this package:

- `npx @capacitor/create-plugin`
- `yarn create @capacitor/plugin`
- `npm install -g @capacitor/create-plugin && create-capacitor-plugin`

### Options

Separate npm options with a `--` separator, e.g. `npm init @capacitor/plugin -- [options]`.

```
--name <name> ............. npm package name (e.g. "capacitor-plugin-example")
--package-id <id> ......... Unique plugin ID in reverse-DNS notation (e.g. "com.mycompany.plugins.example")
--class-name <name> ....... Plugin class name (e.g. "Example")
--repo <url> .............. URL to git repository (e.g. "https://github.com/example/repo")
--author <author> ......... Author name and email (e.g. "Name <name@example.com>")
--license <id> ............ SPDX License ID (e.g. "MIT")
--description <text> ...... Short description of plugin features
```
