<?php

namespace Config;

use CodeIgniter\Config\BaseConfig;

class Cors extends BaseConfig
{
    public array $default = [
        /**
         * Origins for the `Access-Control-Allow-Origin` header.
         */
        'allowedOrigins' => [
            'http://localhost:3000',  // React default port
            'http://localhost:3001',  // Alternative React port
            'http://localhost:5173',  // Vite default port
            // Add your production domain here
            // 'https://yourdomain.com',
        ],

        /**
         * Origin regex patterns for the `Access-Control-Allow-Origin` header.
         */
        'allowedOriginsPatterns' => [
            // Allow any localhost port (development only)
            '#^http://localhost:\d+$#',
            // Allow any subdomain of your domain
            // '#^https://(\w+\.)?yourdomain\.com$#',
        ],

        /**
         * Weather to send the `Access-Control-Allow-Credentials` header.
         */
        'supportsCredentials' => true,  // Set to true if using sessions/cookies

        /**
         * Set headers to allow.
         */
        'allowedHeaders' => [
            'Content-Type',
            'Authorization',
            'X-Requested-With',
            'Accept',
            'Origin',
            'Access-Control-Request-Method',
            'Access-Control-Request-Headers',
        ],

        /**
         * Set headers to expose.
         */
        'exposedHeaders' => [],

        /**
         * Set methods to allow.
         */
        'allowedMethods' => [
            'GET',
            'POST',
            'PUT',
            'DELETE',
            'PATCH',
            'OPTIONS',  // Important: Include OPTIONS for preflight
        ],

        /**
         * Set how many seconds the results of a preflight request can be cached.
         */
        'maxAge' => 7200,
    ];
}