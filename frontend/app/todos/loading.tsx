export default function Loading() {
  return (
    <main className="min-h-screen bg-gray-100 flex justify-center py-15 px-5">
      <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-lg h-fit">
        <h1 className="text-3xl font-bold text-purple-600 mb-5 text-center">
          Todo
        </h1>
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-gray-100 rounded-lg" />
          <div className="h-12 bg-gray-100 rounded-lg" />
          <div className="h-12 bg-gray-100 rounded-lg" />
          <div className="h-10 bg-gray-100 rounded-lg" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    </main>
  );
}
