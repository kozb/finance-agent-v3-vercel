import { Button } from "@/components/ui/button";
import { FileText, TrendingUp, DollarSign, PieChart, FileSearch, Calculator } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

const actions = [
  {
    id: "summarize",
    title: "Summarize Documents",
    description: "Get a quick overview of all uploaded files",
    icon: FileText,
  },
  {
    id: "extract",
    title: "Extract Key Data",
    description: "Pull out important numbers and dates",
    icon: FileSearch,
  },
  {
    id: "categorize",
    title: "Categorize Expenses",
    description: "Automatically sort transactions by type",
    icon: PieChart,
  },
  {
    id: "calculate",
    title: "Calculate Totals",
    description: "Sum up amounts and generate subtotals",
    icon: Calculator,
  },
  {
    id: "trends",
    title: "Analyze Trends",
    description: "Identify spending patterns over time",
    icon: TrendingUp,
  },
  {
    id: "report",
    title: "Generate Report",
    description: "Create a formatted financial report",
    icon: DollarSign,
  },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export const ActionsPanel = () => {
  const { user } = useAuth();
  
  // Fetch financial data - include user ID in query key for proper caching
  const { data: financialData, isLoading } = useQuery({
    queryKey: ["financial-data", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("financial_data")
        .select("*")
        .order("date", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user, // Only fetch when user is logged in
  });

  // Process data for charts
  const processChartData = () => {
    if (!financialData || financialData.length === 0) return null;

    // Group by category
    const categoryData = financialData.reduce((acc: any, item: any) => {
      const category = item.category || "Uncategorized";
      if (!acc[category]) {
        acc[category] = { name: category, value: 0, count: 0 };
      }
      if (item.amount) {
        acc[category].value += Math.abs(Number(item.amount));
        acc[category].count += 1;
      }
      return acc;
    }, {});

    const pieData = Object.values(categoryData).slice(0, 6);

    // Group by date for line/bar chart
    const dateData = financialData.reduce((acc: any, item: any) => {
      if (!item.date) return acc;
      const date = new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (!acc[date]) {
        acc[date] = { date, income: 0, expense: 0 };
      }
      const amount = Number(item.amount) || 0;
      if (item.data_type === "income" || amount > 0) {
        acc[date].income += Math.abs(amount);
      } else {
        acc[date].expense += Math.abs(amount);
      }
      return acc;
    }, {});

    const barData = Object.values(dateData).slice(-10).reverse();

    // Calculate totals
    const totals = financialData.reduce(
      (acc: any, item: any) => {
        const amount = Number(item.amount) || 0;
        if (item.data_type === "income" || amount > 0) {
          acc.income += Math.abs(amount);
        } else {
          acc.expense += Math.abs(amount);
        }
        return acc;
      },
      { income: 0, expense: 0 }
    );

    return { pieData, barData, totals };
  };

  const chartData = processChartData();

  const handleAction = (actionId: string) => {
    console.log("Action clicked:", actionId);
    // TODO: Implement action handlers
  };

  return (
    <div className="h-full flex flex-col bg-panel border-r border-panel-border">
      <div className="p-4 border-b border-panel-border">
        <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Process your uploaded materials
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Financial Overview Cards */}
        {chartData && (
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Income</CardDescription>
                <CardTitle className="text-2xl text-green-600">
                  ${chartData.totals.income.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Expenses</CardDescription>
                <CardTitle className="text-2xl text-red-600">
                  ${chartData.totals.expense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        )}

        {/* Charts */}
        {chartData && chartData.pieData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Expenses by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <RechartsPieChart>
                  <Pie
                    data={chartData.pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.pieData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {chartData && chartData.barData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Income vs Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData.barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="income" fill="#00C49F" name="Income" />
                  <Bar dataKey="expense" fill="#FF8042" name="Expense" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions Grid */}
        <div className="grid gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => handleAction(action.id)}
                className="p-4 rounded-lg border border-border bg-card hover:bg-panel-hover hover:border-primary transition-all text-left group"
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground mb-1">
                      {action.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* No Data Message */}
        {!isLoading && (!financialData || financialData.length === 0) && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground text-center">
                No financial data yet. Upload documents to see charts and statistics.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="p-4 border-t border-panel-border">
        <Button className="w-full" variant="outline">
          View All Actions
        </Button>
      </div>
    </div>
  );
};
