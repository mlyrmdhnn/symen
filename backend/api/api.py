from core.router.router import Route

Route.get('/dashboard', ['DashboardController', 'index'])

Route.get('/settings', ['SettingsController', 'index'])
Route.get('/settings/realtime-chart', ['SettingsController', 'chartStatus'])
Route.get('/settings/theme', ['SettingsController', 'themeStatus'])
Route.put('/settings/realtime-chart/on', ['SettingsController', 'setChartOn'])
Route.put('/settings/realtime-chart/off', ['SettingsController', 'setChartOff'])
Route.put('/settings/theme', ['SettingsController', 'setTheme'])

Route.post('/test', ['TestController', 'index'])
