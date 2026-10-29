package com.college.portal.controller;

import com.college.portal.model.User;
import com.college.portal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // Sabhi registered students ko fetch karne ke liye
    @GetMapping("/students")
    public List<User> getAllStudents() {
        return userRepository.findByRole(User.Role.STUDENT);
    }

    // Student ko block ya unblock karne ke liye
    @PutMapping("/students/{id}/block")
    public ResponseEntity<User> toggleBlockStudent(@PathVariable Long id) {
        return userRepository.findById(id).map(user -> {
            user.setBlocked(!user.isBlocked());
            User saved = userRepository.save(user);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    // Student record delete karne ke liye
    @DeleteMapping("/students/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        return userRepository.findById(id).map(user -> {
            userRepository.delete(user);
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }
}