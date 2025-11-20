import React, { useState, useCallback } from 'react';
import { MapPin, Route, Navigation, Loader2, Search, Trash2, Info } from 'lucide-react';
import MapComponent from './components/MapComponent';
import { generateLocations } from './services/geminiService';
import { LocationPoint } from './types';

function App() {
  const [prompt, setPrompt] = useState('');
  const [points, setPoints] = useState<LocationPoint[]>([]);
  const [isRoute, setIsRoute] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const result = await generateLocations(prompt, isRoute);
      setPoints(result);
      if (result.length === 0) {
        setError("No se encontraron ubicaciones. Intenta ser más específico.");
      }
    } catch (err) {
      console.error(err);
      setError("Error al conectar con la IA. Por favor intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const clearMap = useCallback(() => {
    setPoints([]);
    setPrompt('');
    setIsRoute(false);
    setError(null);
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-slate-100">
      
      {/* Sidebar / Control Panel */}
      <div className="w-full md:w-96 bg-white shadow-xl z-10 flex flex-col h-[40vh] md:h-full border-r border-slate-200">
        <div className="p-6 bg-indigo-600 text-white">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-6 h-6" />
            <h1 className="text-xl font-bold tracking-tight">Cali GeoMapper</h1>
          </div>
          <p className="text-indigo-100 text-sm">
            Explora Cali, Colombia usando Inteligencia Artificial.
          </p>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                ¿Qué deseas buscar?
              </label>
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ej: 'Ruta de los mejores museos', 'Lugares para bailar salsa', o una lista: 'Cristo Rey, Zoológico de Cali'"
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm min-h-[100px] resize-none shadow-sm"
                />
                <Search className="absolute bottom-3 right-3 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRoute}
                  onChange={(e) => setIsRoute(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300"
                />
                <span className="flex items-center gap-1">
                   <Route className="w-4 h-4" /> Ver como Ruta
                </span>
              </label>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading || !prompt}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Buscando...
                  </>
                ) : (
                  <>
                    <Navigation className="w-4 h-4" /> Generar Mapa
                  </>
                )}
              </button>
              
              {points.length > 0 && (
                <button
                  type="button"
                  onClick={clearMap}
                  className="flex items-center justify-center bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 font-medium py-2 px-3 rounded-lg transition-all"
                  title="Limpiar Mapa"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-start gap-2">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="mt-6">
             <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3 flex items-center justify-between">
               Resultados 
               <span className="bg-slate-100 text-slate-600 py-0.5 px-2 rounded-full text-xs">
                 {points.length}
               </span>
             </h2>
             
             {points.length === 0 ? (
               <div className="text-center py-8 text-slate-400">
                 <MapPin className="w-8 h-8 mx-auto mb-2 opacity-20" />
                 <p className="text-sm">Ingresa una búsqueda para ver puntos en el mapa.</p>
               </div>
             ) : (
               <ul className="space-y-3">
                 {points.map((point, idx) => (
                   <li key={point.id} className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm hover:shadow-md transition-shadow group relative">
                     <div className="absolute top-3 right-3 text-xs font-bold text-slate-300 group-hover:text-indigo-300">
                       #{idx + 1}
                     </div>
                     <h3 className="font-bold text-slate-800 text-sm">{point.name}</h3>
                     <p className="text-xs text-slate-500 mt-1 line-clamp-2">{point.description}</p>
                     <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                       <span>LAT: {point.lat.toFixed(3)}</span>
                       <span>LNG: {point.lng.toFixed(3)}</span>
                     </div>
                   </li>
                 ))}
               </ul>
             )}
          </div>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative h-[60vh] md:h-full">
        <MapComponent points={points} isRoute={isRoute} />
        
        {/* Floating Legend or Overlay (Optional) */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-lg border border-slate-200 z-[400] text-xs text-slate-500 hidden md:block">
           Mapa enfocado en Cali, Colombia
        </div>
      </div>
    </div>
  );
}

export default App;
