package com.fitpulse.controller;

import com.fitpulse.model.User;
import com.fitpulse.service.AuthService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ViewController {

    private final AuthService authService;

    public ViewController(AuthService authService) {
        this.authService = authService;
    }

    private void populateUser(Model model) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                User user = authService.getCurrentAuthenticatedUser();
                model.addAttribute("currentUser", user);
                model.addAttribute("isAdmin", user.getRole() == com.fitpulse.model.enums.Role.ADMIN);
            }
        } catch (Exception ignored) {}
    }

    @GetMapping("/")
    public String index(Model model) {
        populateUser(model);
        if (model.containsAttribute("currentUser")) {
            User user = (User) model.getAttribute("currentUser");
            if (user != null && user.getRole() == com.fitpulse.model.enums.Role.ADMIN) {
                return "redirect:/admin/dashboard";
            }
            return "redirect:/dashboard";
        }
        return "index";
    }

    @GetMapping("/login")
    public String login(Model model) {
        populateUser(model);
        return "login";
    }

    @GetMapping("/register")
    public String register(Model model) {
        populateUser(model);
        return "register";
    }

    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        populateUser(model);
        model.addAttribute("activeRoute", "dashboard");
        return "dashboard";
    }

    @GetMapping("/workouts")
    public String workouts(Model model) {
        populateUser(model);
        model.addAttribute("activeRoute", "workouts");
        return "workouts";
    }

    @GetMapping("/analytics")
    public String analytics(Model model) {
        populateUser(model);
        model.addAttribute("activeRoute", "analytics");
        return "analytics";
    }

    @GetMapping("/challenges")
    public String challenges(Model model) {
        populateUser(model);
        model.addAttribute("activeRoute", "challenges");
        return "challenges";
    }

    @GetMapping("/profile")
    public String profile(Model model) {
        populateUser(model);
        model.addAttribute("activeRoute", "profile");
        return "profile";
    }

    @GetMapping("/admin/dashboard")
    public String adminDashboard(Model model) {
        populateUser(model);
        model.addAttribute("activeRoute", "admin-dashboard");
        return "admin-dashboard";
    }

    @GetMapping("/admin/users")
    public String adminUsers(Model model) {
        populateUser(model);
        model.addAttribute("activeRoute", "admin-users");
        return "admin-users";
    }

    @GetMapping("/admin/moderation")
    public String adminModeration(Model model) {
        populateUser(model);
        model.addAttribute("activeRoute", "admin-moderation");
        return "admin-moderation";
    }

    @GetMapping("/admin/settings")
    public String adminSettings(Model model) {
        populateUser(model);
        model.addAttribute("activeRoute", "admin-settings");
        return "admin-settings";
    }
}
