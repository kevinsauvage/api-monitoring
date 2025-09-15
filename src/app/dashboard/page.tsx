"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Plus,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Zap,
} from "lucide-react";

interface ApiConnection {
  id: string;
  name: string;
  provider: string;
  isActive: boolean;
  lastCheck?: {
    status: "SUCCESS" | "FAILURE" | "TIMEOUT" | "ERROR";
    responseTime: number;
    timestamp: string;
  };
  healthChecks: {
    id: string;
    endpoint: string;
    isActive: boolean;
  }[];
}

interface DashboardStats {
  totalConnections: number;
  activeConnections: number;
  healthyConnections: number;
  totalHealthChecks: number;
  avgResponseTime: number;
  monthlyCost: number;
  costChange: number;
}

export default function Dashboard() {
  const { data: session } = useSession();
  const [connections, setConnections] = useState<ApiConnection[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalConnections: 0,
    activeConnections: 0,
    healthyConnections: 0,
    totalHealthChecks: 0,
    avgResponseTime: 0,
    monthlyCost: 0,
    costChange: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setConnections([
        {
          id: "1",
          name: "Stripe API",
          provider: "stripe",
          isActive: true,
          lastCheck: {
            status: "SUCCESS",
            responseTime: 245,
            timestamp: new Date().toISOString(),
          },
          healthChecks: [
            { id: "1", endpoint: "/v1/charges", isActive: true },
            { id: "2", endpoint: "/v1/customers", isActive: true },
          ],
        },
        {
          id: "2",
          name: "Twilio SMS",
          provider: "twilio",
          isActive: true,
          lastCheck: {
            status: "SUCCESS",
            responseTime: 189,
            timestamp: new Date().toISOString(),
          },
          healthChecks: [
            { id: "3", endpoint: "/2010-04-01/Accounts", isActive: true },
          ],
        },
        {
          id: "3",
          name: "SendGrid Email",
          provider: "sendgrid",
          isActive: false,
          lastCheck: {
            status: "FAILURE",
            responseTime: 5000,
            timestamp: new Date(Date.now() - 300000).toISOString(),
          },
          healthChecks: [
            { id: "4", endpoint: "/v3/mail/send", isActive: true },
          ],
        },
      ]);

      setStats({
        totalConnections: 3,
        activeConnections: 2,
        healthyConnections: 2,
        totalHealthChecks: 4,
        avgResponseTime: 478,
        monthlyCost: 127.5,
        costChange: 12.5,
      });

      setIsLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400";
      case "FAILURE":
        return "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400";
      case "TIMEOUT":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400";
      case "ERROR":
        return "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400";
      default:
        return "text-slate-600 bg-slate-100 dark:bg-slate-700 dark:text-slate-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return <CheckCircle className="w-4 h-4" />;
      case "FAILURE":
      case "ERROR":
        return <AlertTriangle className="w-4 h-4" />;
      case "TIMEOUT":
        return <Clock className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Welcome back, {session?.user?.name?.split(" ")[0] || "User"}!
        </h1>
        <p className="text-slate-600 dark:text-slate-300">
          Here's an overview of your API monitoring status.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Total APIs
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.totalConnections}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Healthy
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.healthyConnections}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Avg Response
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.avgResponseTime}ms
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <DollarSign className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Monthly Cost
              </p>
              <div className="flex items-center">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  ${stats.monthlyCost}
                </p>
                <div
                  className={`ml-2 flex items-center ${
                    stats.costChange >= 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {stats.costChange >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span className="text-sm ml-1">
                    {Math.abs(stats.costChange)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* API Connections */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              API Connections
            </h2>
            <Link
              href="/dashboard/connections"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Connection
            </Link>
          </div>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {connections.map((connection) => (
            <div
              key={connection.id}
              className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        connection.isActive ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                      {connection.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                      {connection.provider} • {connection.healthChecks.length}{" "}
                      health checks
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {connection.lastCheck && (
                    <div className="text-right">
                      <div
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          connection.lastCheck.status
                        )}`}
                      >
                        {getStatusIcon(connection.lastCheck.status)}
                        <span className="ml-1">
                          {connection.lastCheck.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {connection.lastCheck.responseTime}ms
                      </p>
                    </div>
                  )}

                  <Link
                    href={`/dashboard/connections/${connection.id}`}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {connections.length === 0 && (
          <div className="p-12 text-center">
            <Zap className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              No API connections yet
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              Get started by adding your first API connection to begin
              monitoring.
            </p>
            <Link
              href="/dashboard/connections"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First API
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
