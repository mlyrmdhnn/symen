from core.router.router import Route

Route.get('/dashboard', ['DashboardController', 'index'])

Route.get('/settings', ['SettingsController', 'index'])
Route.get('/settings/realtime-chart', ['SettingsController', 'chartStatus'])
Route.get('/settings/theme', ['SettingsController', 'themeStatus'])
Route.get('/settings/startup-arguments', ['SettingsController', 'startupArguments'])
Route.get('/services', ['ServiceController', 'index'])
Route.put('/settings/realtime-chart/on', ['SettingsController', 'setChartOn'])
Route.put('/settings/realtime-chart/off', ['SettingsController', 'setChartOff'])
Route.put('/settings/theme', ['SettingsController', 'setTheme'])
Route.put('/settings/startup-arguments', ['SettingsController', 'setStartupArguments'])

Route.post('/services/add', ['ServiceController', 'add'])
Route.post('/services/update', ['ServiceController', 'update'])
Route.post('/services/start', ['ServiceController', 'start'])
Route.post('/services/stop', ['ServiceController', 'stop'])
Route.post('/services/delete', ['ServiceController', 'delete'])
Route.post('/services/logs', ['ServiceController', 'logs'])
Route.post('/services/logs/global', ['ServiceController', 'globalLogs'])

Route.post('/test', ['TestController', 'index'])
