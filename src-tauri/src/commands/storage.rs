use keyring::Entry;
use tauri::command;

const SERVICE_NAME: &str = "com.haydenfd.podcasters-digest";
const API_KEY_USERNAME: &str = "anthropic-api-key";

#[command]
pub fn get_api_key() -> Result<String, String> {
    let entry = Entry::new(SERVICE_NAME, API_KEY_USERNAME)
        .map_err(|e| format!("Failed to access keychain: {}", e))?;

    entry
        .get_password()
        .map_err(|e| format!("Failed to retrieve API key: {}", e))
}

#[command]
pub fn set_api_key(key: String) -> Result<(), String> {
    let entry = Entry::new(SERVICE_NAME, API_KEY_USERNAME)
        .map_err(|e| format!("Failed to access keychain: {}", e))?;

    entry
        .set_password(&key)
        .map_err(|e| format!("Failed to store API key: {}", e))
}
