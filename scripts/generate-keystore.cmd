@echo off
set KEYTOOL="C:\Program Files\Eclipse Adoptium\jdk-25.0.2.10-hotspot\bin\keytool.exe"
echo === Génération du keystore Android pour TWA ===
echo.

if exist android.keystore (
  echo [INFO] android.keystore existe déjà.
  echo Pour le recréer, supprimez d'abord le fichier.
  goto sha256
)

set /p PASS="Choisissez un mot de passe pour le keystore (min 6 caractères) : "
echo.

%KEYTOOL% -genkeypair -v ^
  -keystore android.keystore ^
  -alias catalogue-ia ^
  -keyalg RSA ^
  -keysize 2048 ^
  -validity 10000 ^
  -dname "CN=Catalogue IA, OU=Dev, O=FloA, L=FR, ST=FR, C=FR" ^
  -storepass %PASS% ^
  -keypass %PASS%

if errorlevel 1 (
  echo.
  echo [ERREUR] La génération a échoué.
  pause
  exit /b 1
)

echo.
echo [OK] Keystore généré : android.keystore

:sha256
echo.
echo === Empreinte SHA-256 à copier dans assetlinks.json ===
echo.
set /p PASS2="Mot de passe du keystore : "
%KEYTOOL% -list -v -keystore android.keystore -alias catalogue-ia -storepass %PASS2% | findstr "SHA256"
echo.
echo Copiez la valeur SHA256 ci-dessus dans :
echo   public/.well-known/assetlinks.json
echo   (remplacer REMPLACER_PAR_LE_SHA256_DU_KEYSTORE)
echo.
pause
