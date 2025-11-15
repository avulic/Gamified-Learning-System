<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Top Navigation Bar -->
        <div class="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div class="flex items-center space-x-4">
                <h1 class="text-2xl font-bold text-gray-900">⚡ Tempo</h1>
                <span class="text-sm text-gray-500">Dashboard</span>
            </div>
            <div class="flex items-center space-x-4">
                <InputText v-model="periodValue" options="30 days,3 months,1 year"
                    class="border border-gray-300 rounded-md px-3 py-1 text-sm" />
                <InputText placeholder="Search anything..." class="w-64 border border-gray-300 rounded-md px-3 py-2"
                    icon="pi pi-search" />
                <Button label="Add +" icon="pi pi-plus" class="p-button-text" />
                <Button label="Invite" icon="pi pi-user-plus" class="p-button-text" />
            </div>
        </div>

        <div class="flex">
            <!-- Left Sidebar Menu -->
            <div class="w-64 bg-white shadow-sm border-r border-gray-200 p-6 space-y-4">
                <SidebarMenuItem label="📊 Dashboard" :active="true" />
                <SidebarMenuItem label="🔔 Notifications" />
                <SidebarMenuItem label="💰 Earnings" />
                <SidebarMenuItem label="💸 Spending" />
                <SidebarMenuItem label="📝 Subscriptions" />
                <SidebarMenuItem label="📊 Reports" />
                <SidebarMenuItem label="💳 Transactions" />
                <SidebarMenuItem label="⚡ Performance" />
                <div class="border-t border-gray-200 pt-4">
                    <SidebarMenuItem label="⚙️ General" />
                    <SidebarMenuItem label="🔧 Settings" />
                    <SidebarMenuItem label="❓ Help Center" />
                    <SidebarMenuItem label="📝 Feedback" />
                </div>
            </div>

            <!-- Main Content -->
            <div class="flex-1 p-6">
                <!-- Period Controls -->
                <div class="flex items-center justify-between mb-6">
                    <div class="flex space-x-2">
                        <SelectButton v-model="periodValue" :options="options" optionLabel="name" multiple
                            aria-labelledby="multiple" class="text-sm" />
                    </div>
                    <div class="flex space-x-2">
                        <Button label="Export" icon="pi pi-download" class="p-button-outlined" />
                        <Button label="New" icon="pi pi-plus" class="p-button-outlined" />
                    </div>
                </div>

                <!-- KPI Cards Row -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <Card class="shadow-sm">
                        <template #title>Revenue</template>
                        <template #content>
                            <div class="text-3xl font-bold text-blue-600">$612,100</div>
                            <div class="text-sm text-green-600">+20% $212,230 Last 30 days</div>
                        </template>
                    </Card>
                    <Card class="shadow-sm">
                        <template #title>Active Subscribers</template>
                        <template #content>
                            <div class="text-3xl font-bold text-blue-600">42,243</div>
                            <div class="text-sm text-green-600">+12% 1,486 Last 30 days</div>
                        </template>
                    </Card>
                    <Card class="shadow-sm">
                        <template #title>New Subs</template>
                        <template #content>
                            <div class="text-3xl font-bold text-blue-600">1,605</div>
                            <div class="text-sm text-green-600">+20% 201 Last 30 days</div>
                        </template>
                    </Card>
                    <Card class="shadow-sm">
                        <template #title>Churn Rate</template>
                        <template #content>
                            <div class="text-3xl font-bold text-red-600">3.2%</div>
                            <div class="text-sm text-green-600">-8.0% Last 30 days</div>
                        </template>
                    </Card>
                </div>

                <!-- Charts Row -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <Card class="shadow-sm">
                        <template #title>Revenue Flow</template>
                        <template #content>
                            <div class="mb-4">
                                <span class="text-lg font-semibold">Total Revenue</span>
                                <span class="ml-2 text-sm text-green-600">+20% $2,423 Last 30 days</span>
                            </div>
                            <Chart type="line" :data="revenueChartData" :options="chartOptions" />
                            <div class="mt-4 text-center">
                                <p class="text-sm text-green-600 font-semibold">New Record Achieved!</p>
                                <p class="text-xs text-gray-500">November with $6,745,500 from start</p>
                            </div>
                        </template>
                    </Card>
                    <Card class="shadow-sm">
                        <template #title>Leads Breakdown</template>
                        <template #content>
                            <div class="text-center mb-4">
                                <div class="text-3xl font-bold">2,351</div>
                                <div class="text-sm text-gray-500">Total Leads</div>
                            </div>
                            <Chart type="doughnut" :data="leadsChartData" :options="chartOptions" />
                            <div class="mt-4 space-y-2 text-sm">
                                <div class="flex justify-between"><span>Website</span><span>1,240</span></div>
                                <div class="flex justify-between"><span>Paid Ads</span><span>504</span></div>
                                <div class="flex justify-between"><span>Organic Ads</span><span>403</span></div>
                                <div class="flex justify-between"><span>Referral</span><span>204</span></div>
                            </div>
                            <Button label="More details →" class="p-button-text mt-2" />
                        </template>
                    </Card>
                </div>

                <!-- Subscribers Table -->
                <Card class="shadow-sm">
                    <template #title>42,243 Active Subscribers</template>
                    <template #content>
                        <div class="flex justify-between items-center mb-4">
                            <InputText placeholder="Search for a subscriber ×" class="w-64" />
                            <div class="flex space-x-2">
                                <Button icon="pi pi-filter" class="p-button-text" />
                                <Button label="Export" icon="pi pi-download" class="p-button-outlined" />
                            </div>
                        </div>
                        <DataTable :value="subscribers" :paginator="true" :rows="10" class="w-full">
                            <Column field="id" header="Subscriber ID" />
                            <Column field="name" header="Name">
                                <template #body="slotProps">
                                    <div class="flex items-center">
                                        <Avatar :label="slotProps.data.name.charAt(0)" class="mr-2" />
                                        {{ slotProps.data.name }}
                                    </div>
                                </template>
                            </Column>
                            <Column field="email" header="Email" />
                            <Column field="status" header="Status">
                                <template #body="slotProps">
                                    <Tag :value="slotProps.data.status"
                                        :severity="getStatusSeverity(slotProps.data.status)" />
                                </template>
                            </Column>
                            <Column field="signupDate" header="Sign up Date" />
                            <Column field="source" header="Source">
                                <template #body="slotProps">
                                    <Tag :value="slotProps.data.source" class="p-tag-info" />
                                </template>
                            </Column>
                        </DataTable>
                    </template>
                </Card>
            </div>

            <!-- Right Sidebar (Free Trial Notice) -->
            <div class="w-80 bg-gradient-to-b from-purple-50 to-pink-50 border-l border-gray-200 p-6">
                <div class="text-center space-y-4">
                    <div class="bg-white rounded-lg p-4 shadow-sm">
                        <h3 class="font-bold text-purple-600">Free Trial Version</h3>
                        <p class="text-sm text-gray-600">Upgrade to continue</p>
                        <p class="text-xs text-gray-500 mb-4">Upgrade in 4 days</p>
                        <Button label="Select plan →" class="w-full p-button-outlined p-button-purple" />
                    </div>
                    <div class="text-xs text-gray-500">
                        <p>neroo@design.com</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { defineComponent, h, ref } from 'vue'
import Card from 'primevue/card'
import Chart from 'primevue/chart'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Avatar from 'primevue/avatar'
import Tag from 'primevue/tag'
import ButtonToggle from 'primevue/togglebutton' // Assuming a custom toggle for periods

// Mock data
const periodValue = ref('30 days')
const options = ref([
    { name: '30 days', code: '30 days' },
    { name: '3 months', code: '3 months' },
    { name: '1 year', code: '1 year' }
])
const subscribers = ref([
    { id: '001', name: 'John Lake', email: 'john@example.com', status: 'Unsubscribed', signupDate: '2025-01-15', source: 'Website' },
    { id: '002', name: 'Kate Williams', email: 'kate.williams@example.com', status: 'Subscribed', signupDate: '2025-02-19', source: 'Organic Ads' },
    { id: '003', name: 'Ahmed Hamdi', email: 'ahmed@example.com', status: 'Unsubscribed', signupDate: '2025-02-19', source: 'Referral' },
    { id: '004', name: 'Sarah Johnson', email: 'sarah@example.com', status: 'Subscribed', signupDate: '2025-01-15', source: 'Referral' },
    { id: '005', name: 'Mark Wilson', email: 'markw@example.com', status: 'Inactive', signupDate: '2025-03-08', source: 'Organic Ads' },
    { id: '006', name: 'Sarah Luis', email: 'sarah.luis@example.com', status: 'Subscribed', signupDate: '2025-12-19', source: 'Website' }
])

const revenueChartData = ref({
    labels: ['18 Oct 2025', 'Nov 2025', '8 Nov 2025'],
    datasets: [{ data: [6745500, 8455000, 9000000], borderColor: '#3B82F6', fill: false }]
})

const leadsChartData = ref({
    labels: ['Website', 'Paid Ads', 'Organic Ads', 'Referral'],
    datasets: [{ data: [1240, 504, 403, 204], backgroundColor: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B'] }]
})

const chartOptions = ref({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } }
})

const getStatusSeverity = (status: string) => {
    switch (status) {
        case 'Subscribed': return 'success'
        case 'Unsubscribed': return 'danger'
        case 'Inactive': return 'warning'
        default: return 'info'
    }
}
const SidebarMenuItem = defineComponent({
    props: {
        label: {
            type: String,
            required: true
        },
        active: {
            type: Boolean,
            default: false
        }
    },
    setup(props) {
        return () => h(
            'div',
            {
                class: `p-2 rounded cursor-pointer text-sm ${props.active ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`
            },
            props.label
        )
    }
})
</script>

<style scoped>
/* Tailwind is assumed to be globally configured in the project */
:deep(.p-card) {
    @apply border-0;
}

:deep(.p-datatable) {
    @apply border-0;
}

:deep(.p-datatable-thead > tr > th) {
    @apply bg-gray-50 text-gray-700 font-medium;
}
</style>