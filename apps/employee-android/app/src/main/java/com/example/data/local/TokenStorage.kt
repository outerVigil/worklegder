package com.example.data.local

import android.content.Context
import android.content.SharedPreferences
import com.example.data.model.User
import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory

class TokenStorage(context: Context) {
    private val prefs: SharedPreferences =
        context.getSharedPreferences("workledger_secure_prefs", Context.MODE_PRIVATE)

    private val moshi = Moshi.Builder()
        .add(KotlinJsonAdapterFactory())
        .build()
    private val userAdapter = moshi.adapter(User::class.java)

    companion object {
        private const val KEY_ACCESS_TOKEN = "access_token"
        private const val KEY_REFRESH_TOKEN = "refresh_token"
        private const val KEY_USER_JSON = "current_user_json"
        private const val KEY_BASE_URL = "backend_base_url"
        private const val DEFAULT_BASE_URL = "http://10.0.2.2:3000/api/v1/"
    }

    fun saveTokens(accessToken: String, refreshToken: String) {
        prefs.edit()
            .putString(KEY_ACCESS_TOKEN, accessToken)
            .putString(KEY_REFRESH_TOKEN, refreshToken)
            .apply()
    }

    fun getAccessToken(): String? = prefs.getString(KEY_ACCESS_TOKEN, null)

    fun getRefreshToken(): String? = prefs.getString(KEY_REFRESH_TOKEN, null)

    fun saveUser(user: User) {
        val json = userAdapter.toJson(user)
        prefs.edit().putString(KEY_USER_JSON, json).apply()
    }

    fun getUser(): User? {
        val json = prefs.getString(KEY_USER_JSON, null) ?: return null
        return try {
            userAdapter.fromJson(json)
        } catch (e: Exception) {
            null
        }
    }

    fun getBaseUrl(): String = prefs.getString(KEY_BASE_URL, DEFAULT_BASE_URL) ?: DEFAULT_BASE_URL

    fun setBaseUrl(url: String) {
        val cleanUrl = if (url.endsWith("/")) url else "$url/"
        prefs.edit().putString(KEY_BASE_URL, cleanUrl).apply()
    }

    fun clearSession() {
        prefs.edit()
            .remove(KEY_ACCESS_TOKEN)
            .remove(KEY_REFRESH_TOKEN)
            .remove(KEY_USER_JSON)
            .apply()
    }

    fun isLoggedIn(): Boolean = getAccessToken() != null && getUser() != null
}
