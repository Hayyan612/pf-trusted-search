import Link from "next/link";

const BUTTON_CLASS =
  "block w-full rounded-2xl bg-zinc-900 px-6 py-6 text-center text-xl font-semibold text-white active:bg-zinc-700";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold">Trusted Home Search</h1>
        <p className="text-sm text-zinc-500">Princess Tower, Dubai Marina</p>
      </header>
      <Link href="/rent" className={BUTTON_CLASS}>
        I want to rent
      </Link>
      <Link href="/buy" className={BUTTON_CLASS}>
        I want to buy
      </Link>
    </div>
  );
}
