import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from "recharts";
import { Loader2, Users, Eye, FileText as FileTextIcon, TrendingUp, AlertCircle, RotateCw } from "lucide-react";

const COLORS = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

export default function AdminDashboard() {
  const [dateRange, setDateRange] = useState("30d");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const getFilterParams = () => {
    const end = new Date();
    const start = new Date();
    
    if (dateRange === "7d") {
      start.setDate(end.getDate() - 7);
    } else if (dateRange === "30d") {
      start.setDate(end.getDate() - 30);
    } else if (dateRange === "month") {
      start.setDate(1); // First day of current month
    } else if (dateRange === "custom" && customStart && customEnd) {
      return { 
        startDate: new Date(customStart).toISOString().split('T')[0], 
        endDate: new Date(customEnd).toISOString().split('T')[0] 
      };
    } else {
      return undefined;
    }
    
    return { 
      startDate: start.toISOString().split('T')[0], 
      endDate: end.toISOString().split('T')[0] 
    };
  };

  const { data: stats, isLoading, error, refetch, isFetching } = trpc.admin.getStats.useQuery(getFilterParams());

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-accent" size={40} />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="bg-red-50 p-8 rounded-xl max-w-md">
          <AlertCircle size={48} className="text-red-500 mb-4 mx-auto" />
          <h2 className="text-2xl font-bold mb-2 text-red-900">Erro ao Carregar Dashboard</h2>
          <p className="text-red-700 mb-6">
            {error?.message || "Não foi possível carregar as estatísticas. Tente novamente."}
          </p>
          <button 
            onClick={() => refetch()}
            disabled={isFetching}
            className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-red-700 transition-all font-bold flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
          >
            <RotateCw size={18} className={isFetching ? "animate-spin" : ""} />
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  const summaryCards = [
    { title: "Total de Notícias", value: stats.summary.totalPosts, icon: FileTextIcon, color: "text-blue-600" },
    { title: "Visualizações Totais", value: stats.summary.totalViews.toLocaleString(), icon: Eye, color: "text-green-600" },
    { title: "Usuários Cadastrados", value: stats.summary.totalUsers, icon: Users, color: "text-purple-600" },
    { title: "Média por Notícia", value: Math.round(stats.summary.totalViews / (stats.summary.totalPosts || 1)), icon: TrendingUp, color: "text-red-600" },
  ];

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do desempenho do portal</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 bg-card p-2 rounded-xl border border-border shadow-sm">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-muted border-none rounded-lg px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-accent outline-none"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="month">Mês Atual</option>
            <option value="custom">Período Personalizado</option>
          </select>
          
          {dateRange === "custom" && (
            <div className="flex items-center gap-2 animate-in slide-in-from-right-4">
              <input 
                type="date" 
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="bg-muted border-none rounded-lg px-2 py-1.5 text-xs font-semibold outline-none"
              />
              <span className="text-muted-foreground text-xs font-bold">até</span>
              <input 
                type="date" 
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="bg-muted border-none rounded-lg px-2 py-1.5 text-xs font-semibold outline-none"
              />
            </div>
          )}
          
          <button 
            onClick={() => refetch()}
            disabled={isFetching}
            className={`p-2 rounded-lg transition-colors text-accent ${isFetching ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted'}`}
            title="Atualizar dados"
          >
            <RotateCw size={18} className={isFetching ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card) => (
          <div key={card.title} className="bg-card p-6 rounded-xl border border-border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg bg-muted ${card.color}`}>
                <card.icon size={24} />
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
            <h3 className="text-3xl font-bold mt-1">{card.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Line Chart - Views per Day */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Acessos Diários</h3>
            <span className="text-xs font-bold text-muted-foreground uppercase bg-muted px-2 py-1 rounded">
              {dateRange === "7d" ? "Últimos 7 dias" : dateRange === "30d" ? "Últimos 30 dias" : dateRange === "month" ? "Mês Atual" : "Personalizado"}
            </span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.viewsByDay}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="day" 
                  tickFormatter={(val) => {
                    try {
                      return new Date(val).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
                    } catch (e) {
                      return val;
                    }
                  }}
                  fontSize={12}
                />
                <YAxis fontSize={12} />
                <Tooltip 
                  labelFormatter={(val) => {
                    try {
                      return new Date(val).toLocaleDateString('pt-BR');
                    } catch (e) {
                      return val;
                    }
                  }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#ef4444" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: "#ef4444" }}
                  activeDot={{ r: 6 }}
                  name="Visualizações"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart - Views by Category */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <h3 className="text-xl font-bold mb-6">Audiência por Categoria</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.viewsByCategory}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                >
                  {stats.viewsByCategory.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Authors Bar Chart */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <h3 className="text-xl font-bold mb-6">Produção por Autor (Top 5)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.topAuthors} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" fontSize={12} />
                <YAxis dataKey="author" type="category" fontSize={12} width={120} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Notícias" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Posts Table */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <h3 className="text-xl font-bold mb-6">Top 10 Notícias Mais Visualizadas</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 font-semibold text-muted-foreground">Posição</th>
                  <th className="py-3 font-semibold text-muted-foreground">Título</th>
                  <th className="py-3 font-semibold text-muted-foreground text-right">Visualizações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stats.topPosts.slice(0, 5).map((post, index) => (
                  <tr key={post.id} className="hover:bg-muted/50 transition-colors text-sm">
                    <td className="py-3 font-bold text-muted-foreground">#{index + 1}</td>
                    <td className="py-3 font-semibold max-w-[200px] truncate">{post.title}</td>
                    <td className="py-3 text-right font-mono font-bold text-accent">{post.views.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
