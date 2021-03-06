# Percival

Percival is a Node.js application used by the B&H Direct eBook Development team to assist with tagging Bible references in EPUB content documents, according to a [documented style](https://style.bhdirect-ebooks.org/code/data_types.html).

_Using context tags as indicated in the style guide is essential to a better experience and improved accuracy._

## Install

Install globally using npm:

```bash
sudo npm i -g @bhdirect/percival
```

## Use

#### Begin

To begin, navigate to the EPUB's root directory via command line and simply enter `percival`.

```
cd path/to/epub/root
percival
```

#### Continue

Once the initial tagging is complete and the server has started, it can be restarted (from the EPUB's root directory) with the `continue` command to continue reviewing references.

```
percival continue
```

#### Finish

When all reference review work has been completed via percival's web interface, finalize the changes with the `finish` command (again, from the EPUB's root directory).

```
percival finish
```

## Help

Help is available in the web interface by clicking the "Help" button or by pressing `h`.

See also: [Using Percival](https://www.youtube.com/playlist?list=PLifYXRAIGRblYIXC9-SiQOXCnGBb2h71l)

## Info

Author: Weston Littrell

License: MIT