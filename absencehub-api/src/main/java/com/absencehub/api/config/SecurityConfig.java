package com.absencehub.api.config;

import com.absencehub.api.security.JwtAuthFilter;
import com.absencehub.api.security.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

import static org.springframework.http.HttpMethod.*;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsServiceImpl userDetailsService;

    @Value("${app.cors.allowed-origins:http://localhost:4200}")
    private String allowedOrigins;

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Auth pública
                        .requestMatchers(POST, "/api/v1/auth/login").permitAll()
                        // Swagger UI
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        // Absences
                        .requestMatchers(GET, "/api/v1/absences/all").hasRole("ADMIN")
                        .requestMatchers(GET, "/api/v1/absences/team").authenticated()
                        .requestMatchers(PATCH, "/api/v1/absences/*/approve").hasAnyRole("MANAGER", "ADMIN")
                        .requestMatchers(PATCH, "/api/v1/absences/*/reject").hasAnyRole("MANAGER", "ADMIN")
                        // Users
                        .requestMatchers(GET, "/api/v1/users/me").authenticated()
                        .requestMatchers(PUT, "/api/v1/users/me").authenticated()
                        .requestMatchers(GET, "/api/v1/users/search").authenticated()
                        .requestMatchers("/api/v1/users/**").hasRole("ADMIN")
                        // Teams
                        .requestMatchers(POST, "/api/v1/teams").hasRole("ADMIN")
                        .requestMatchers(DELETE, "/api/v1/teams/**").hasRole("ADMIN")
                        .requestMatchers(POST, "/api/v1/teams/*/members").hasRole("ADMIN")
                        .requestMatchers(GET, "/api/v1/teams/**").hasAnyRole("MANAGER", "ADMIN")
                        // Reports
                        .requestMatchers("/api/v1/reports/**").hasAnyRole("MANAGER", "ADMIN")
                        // Todo lo demás requiere autenticación
                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        var config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of(allowedOrigins, "http://localhost:4200"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        var source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }

    @Bean
    AuthenticationProvider authenticationProvider() {
        var provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
