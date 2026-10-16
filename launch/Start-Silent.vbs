' Start-Silent.vbs
' Launches Cafe Panel silently and opens the browser only after its server is ready.

Option Explicit

Dim shell, fso, scriptDir, projectDir, logPath, url
Dim waited, maxWait, serverStatus, ready

Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
projectDir = fso.GetParentFolderName(scriptDir)
logPath = scriptDir & "\server.log"
url = "http://localhost:3000"

shell.CurrentDirectory = projectDir

If Not fso.FolderExists(projectDir & "\node_modules") Then
  MsgBox "Dependencies are not installed." & vbCrLf & vbCrLf & _
         "Please run Install.bat first.", vbCritical, "Cafe Panel"
  WScript.Quit 1
End If

If Not fso.FolderExists(projectDir & "\.next") Then
  MsgBox "Production build was not found." & vbCrLf & vbCrLf & _
         "Please run Install.bat first.", vbCritical, "Cafe Panel"
  WScript.Quit 1
End If

serverStatus = GetServerStatus()
If serverStatus = 0 Then
  shell.Run url, 1, False
  WScript.Quit 0
ElseIf serverStatus = 2 Then
  MsgBox "Port 3000 is occupied by another application." & vbCrLf & vbCrLf & _
         "Cafe Panel was not started, and the other process was left untouched.", _
         vbExclamation, "Cafe Panel"
  WScript.Quit 1
ElseIf serverStatus <> 1 Then
  MsgBox "Could not safely check whether Cafe Panel is running.", _
         vbCritical, "Cafe Panel"
  WScript.Quit 1
End If

' Include the project path in the parent command line so Stop.bat can verify
' ownership before terminating a process tree.
Dim cmd
cmd = "cmd /c cd /d """ & projectDir & """ && npm run start > """ & logPath & """ 2>&1"
shell.Run cmd, 0, False

waited = 0
maxWait = 30
ready = False
Do While waited < maxWait
  WScript.Sleep 1000
  waited = waited + 1
  serverStatus = GetServerStatus()
  If serverStatus = 0 Then
    ready = True
    Exit Do
  ElseIf serverStatus = 2 Then
    MsgBox "Port 3000 became occupied by an unrecognized application." & vbCrLf & _
           "Cafe Panel did not take over or stop that process.", _
           vbExclamation, "Cafe Panel"
    WScript.Quit 1
  End If
Loop

If Not ready Then
  MsgBox "Server did not start within " & maxWait & " seconds." & vbCrLf & vbCrLf & _
         "Check the log file:" & vbCrLf & logPath, vbCritical, "Cafe Panel"
  WScript.Quit 1
End If

shell.Run url, 1, False
WScript.Quit 0

Function GetServerStatus()
  Dim check, output
  Set check = shell.Exec("powershell -ExecutionPolicy Bypass -NoProfile -File """ & _
    scriptDir & "\ServerProcess.ps1"" -Action status")
  output = check.StdOut.ReadAll()
  GetServerStatus = check.ExitCode
End Function
