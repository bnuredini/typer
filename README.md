# Typer

## What is this?

A simple test typing game, where you're given a block of text and you try to
write it as fast as possible. Similar to The Typing Cat and Monkeytype.

Useful for learning touch typing to type faster and for trying out your new keyboard.

## Screenshots

![screenshot1](./docs/imgs/screenshot1.png)

![screenshot2](./docs/imgs/screenshot2.png)

## Trying it out 

### Online 

This game is hosted via GitHub pages, try it out over at https://bnuredini.github.io/typer.

### Running locally

There's a small server program written in Go that serves files from `ui/`. Build and run the
server application by running

```
cd backend
go build 
./typer
```

then visit http://localhost:8080 and start typing.

## License

See the [license file](./LICENSE).

