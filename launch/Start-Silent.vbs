' Start-Silent.vbs
' Launches Cafe Panel silently in the background and opens the browser.
' No console window is shown.

Option Explicit

Dim shell, fso, scriptDir, projectDir, logPath, url, port, alreadyRunning
Dim wmi, processes, proc, cmd, waited, maxWait

Set shell = CreateObject("WScript.Shell")
Set fso   = CreateObject("Scripting.FileSystemObject")

scriptDir  = fso.GetParentFolderName(WScript.ScriptFullName)
projectDir = fso.GetParentFolderName(scriptDir)
logPath    = scriptDir & "\server.log"
url        = "http://localhost:3000"
port       = 3000

shell.CurrentDirectory = projectDir

' --- Check that the project is set up ---
If Not fso.FolderExists(projectDir & "\node_modules") Then
  MsgBox "Dependencies are not installed." & vbCrLf & vbCrLf & _
         "Please run Install.bat first.", _
         vbCritical, "Cafe Panel"
  WScript.Quit 1
End If

If Not fso.FolderExists(projectDir & "\.next") Then
  MsgBox "Production build was not found." & vbCrLf & vbCrLf & _
         "Please run Install.bat first.", _
         vbCritical, "Cafe Panel"
  WScript.Quit 1
End If

' --- Check whether the server is already listening on port 3000 ---
alreadyRunning = False
Set wmi = GetObject("winmgmts:\\.\root\cimv2")
Set processes = wmi.ExecQuery( _
  "SELECT * FROM Win32_Process WHERE Name = 'node.exe'")

' Quick check via netstat — simpler and reliable
Dim exec, out
Set exec = shell.Exec("cmd /c netstat -ano | findstr /R /C:"":3000 .*LISTENING""")
out = exec.StdOut.ReadAll()
If Len(Trim(out)) > 0 Then alreadyRunning = True

' --- If already running, just open the browser ---
If alreadyRunning Then
  shell.Run url, 1, False
  WScript.Quit 0
End If

' --- Start the server silently ---
' 0 = hidden window, False = don't wait
cmd = "cmd /c npm run start > """ & logPath & """ 2>&1"
shell.Run cmd, 0, False

' --- Wait until the server is listening (max ~30s) ---
waited = 0
maxWait = 30
Do While waited < maxWait
  WScript.Sleep 1000
  waited = waited + 1
  Set exec = shell.Exec("cmd /c netstat -ano | findstr /R /C:"":3000 .*LISTENING""")
  out = exec.StdOut.ReadAll()
  If Len(Trim(out)) > 0 Then Exit Do
Loop

If Len(Trim(out)) = 0 Then
  MsgBox "Server did not start within " & maxWait & " seconds." & vbCrLf & vbCrLf & _
         "Check the log file:" & vbCrLf & logPath, _
         vbCritical, "Cafe Panel"
  WScript.Quit 1
End If

' --- Open the browser ---
shell.Run url, 1, False

WScript.Quit 0