# Pylon potato economy
To use this module in [Pylon](https://pylon.bot/), go to the editor, create a new file called `potato.ts`, copy the contents of this repositorys `potato.ts` into it and then put the following in your `main.ts`:
```ts
import './potato';
```

If you intend to use the potato lottery system. you also have to define a lottery channel (by its channel ID) in your `main.ts`:
```ts
global.POTATO_LOTTERY_CHANNEL = '693621234365366302';
```