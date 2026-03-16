# POS Print Agent (Windows Service) Setup

## 1) Build EXE (one time)

Install .NET 8 SDK on any Windows PC (developer PC).

Open PowerShell in this folder:

`print-agent\PosPrintAgent`

Run:

```powershell
dotnet restore
dotnet publish -c Release -r win-x64 -p:PublishSingleFile=true
```

Output folder:

`print-agent\PosPrintAgent\bin\Release\net8.0-windows\win-x64\publish\`

Copy these files to the kitchen PC (example folder):

`C:\POS-PrintAgent\`

Files:
- `PosPrintAgent.exe`
- `appsettings.json`

## 2) Configure appsettings.json

Edit `C:\POS-PrintAgent\appsettings.json`:

- `serverUrl`: your server (example `https://erp.erpofficial.com`)
- `deviceId`: same as POS → Print Devices device id (example `kitchen-pc-1`)
- `apiToken`: token from POS → Print Devices (copy when created/rotated)

## 3) Test in console (recommended before service)

Open PowerShell in `C:\POS-PrintAgent\` and run:

```powershell
.\PosPrintAgent.exe
```

If config is correct, it will keep running and you should see the device “Last Seen” update in POS → Print Devices.

Stop it with Ctrl+C.

## 4) Install as Windows Service (no console window)

Open PowerShell **as Administrator** and run:

```powershell
sc.exe create "POS Print Agent" binPath= "\"C:\POS-PrintAgent\PosPrintAgent.exe\"" start= auto
sc.exe description "POS Print Agent" "Prints KOT jobs for POS categories"
sc.exe failure "POS Print Agent" reset= 0 actions= restart/5000/restart/5000/restart/5000
sc.exe start "POS Print Agent"
```

## 5) Verify service is running

### Option A (Services UI)
- Press Win+R → `services.msc`
- Find “POS Print Agent”
- Status should be “Running”

### Option B (Command)

```powershell
sc.exe query "POS Print Agent"
```

## 6) Verify printing works

1. In POS → Categories, ensure each category has:
   - Printer Device ID = your device id
   - Printer Name is correct
2. Place order → Send to Kitchen
3. Check POS → Print Jobs:
   - status should move pending → printing → printed

## Troubleshooting

### Check agent log file

The agent writes a local log file in the same folder as the EXE:

`C:\POS-PrintAgent\agent.log`

This shows pulled job ids, print success/failure, and ack failures.

### If jobs stay on "printing"

This usually means the agent pulled the job but got stuck (printer driver/spooler) or couldn't ack.

Steps:
1. Restart Windows service: `services.msc` → POS Print Agent → Restart
2. Restart Print Spooler service: `services.msc` → Print Spooler → Restart
3. Clear the printer queue and try again
4. Open `agent.log` and check the latest error message

### If printing works in Notepad but service printing fails

Change the service account to a real Windows user:
1. `services.msc` → POS Print Agent → Properties → Log On tab
2. Select "This account" and choose your Windows user
3. Restart POS Print Agent service

## 7) Uninstall service

Open PowerShell **as Administrator**:

```powershell
sc.exe stop "POS Print Agent"
sc.exe delete "POS Print Agent"
```
