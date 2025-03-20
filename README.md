
![HITL](tools.png)

## 시작하기

.env.local.example 을 .env.local 로 copy 하고 OPENAI_API_KEY 값을 세팅해야 합니다.

```bash
cp .env.local.example .env.local
```

gemini-2.0-flash-exp 모델을 사용하려면  GOOGLE_GENERATIVE_AI_API_KEY 가 정의되어야 합니다.

'Loading Spinner' 데모를 찾아오신 분들은 page.tsx 를 열어 redirect('/use-chat-streamdata-multistep') 구문을 활성화 합니다.

'Human In The Loop' 데모는 page.tsx 를 열어 redirect('/use-chat-human-in-the-loop') 구문을 활성화 합니다.


```bash
pnpm install
pnpm dev

```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
