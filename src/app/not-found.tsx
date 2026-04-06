export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-black text-white mb-4">404</h1>
      <p className="text-gray-400 mb-6">Página no encontrada</p>
      <a href="/" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all">
        Volver al inicio
      </a>
    </div>
  );
}
