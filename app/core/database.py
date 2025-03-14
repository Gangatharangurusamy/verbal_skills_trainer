import sqlite3

# Database Path
DB_PATH = "app/database/training_data.db"

def create_table():
    """Create the responses table if it doesn't exist."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_responses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            module TEXT,
            user_response TEXT,
            ai_feedback TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    conn.commit()
    conn.close()

def save_response(user_id, module, user_response, ai_feedback):
    """Save user responses and AI feedback to the database."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute('''
        INSERT INTO user_responses (user_id, module, user_response, ai_feedback)
        VALUES (?, ?, ?, ?)
    ''', (user_id, module, user_response, ai_feedback))

    conn.commit()
    conn.close()

def get_user_responses(user_id):
    """Retrieve all responses from the database for a given user."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute('''
        SELECT user_response, ai_feedback FROM user_responses WHERE user_id = ?
    ''', (user_id,))

    responses = cursor.fetchall()
    conn.close()

    if not responses:
        return None  # No records found

    return [{"user_response": row[0], "ai_feedback": row[1]} for row in responses]  # Return structured responses
