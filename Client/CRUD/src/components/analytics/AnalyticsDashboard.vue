<script setup lang="ts">
import { defineProps } from 'vue';
import { useAnalytics } from './useAnalytics';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const props = defineProps<{
    userId: string;
}>();

const { analyticsData, isLoading, error, refreshAnalytics } = useAnalytics(props.userId);
</script>

<template>
    <div class="bg-white rounded-lg shadow-lg p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Completion Rate Card -->
            <div class="bg-blue-50 rounded-lg p-4">
                <h3 class="text-lg font-semibold text-blue-900">Completion Rate</h3>
                <div class="mt-2 text-3xl font-bold text-blue-600">
                    {{ analyticsData?.completionRate }}%
                </div>
            </div>

            <!-- Time Spent Card -->
            <div class="bg-green-50 rounded-lg p-4">
                <h3 class="text-lg font-semibold text-green-900">Time Spent</h3>
                <div class="mt-2 text-3xl font-bold text-green-600">
                    {{ analyticsData?.timeSpent }} hrs
                </div>
            </div>

            <!-- Achievements Card -->
            <div class="bg-purple-50 rounded-lg p-4">
                <h3 class="text-lg font-semibold text-purple-900">Achievements</h3>
                <div class="mt-2 text-3xl font-bold text-purple-600">
                    {{ analyticsData?.achievementsCount }}
                </div>
            </div>
        </div>

        <!-- Performance Chart -->
        <div class="mt-8">
            <h3 class="text-xl font-semibold mb-4">Performance Metrics</h3>
            <div class="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData?.performanceMetrics}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>

        <!-- Recent Activities -->
        <div class="mt-8">
            <h3 class="text-xl font-semibold mb-4">Recent Activities</h3>
            <div class="space-y-4">
                <div v-for="activity in analyticsData?.recentActivities" :key="activity.timestamp"
                    class="flex items-center p-4 bg-gray-50 rounded-lg">
                    <div class="flex-1">
                        <p class="text-sm text-gray-600">
                            {{ activity.details }}
                        </p>
                        <p class="text-xs text-gray-500">
                            {{ new Date(activity.timestamp).toLocaleString() }}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>