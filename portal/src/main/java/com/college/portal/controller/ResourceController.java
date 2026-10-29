package com.college.portal.controller;

import com.college.portal.model.Resource;
import com.college.portal.repository.Resourcerepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin(origins = "http://localhost:5173")
public class ResourceController {

    @Autowired
    private Resourcerepo resourceRepository;

    private static final String UPLOAD_DIR = "uploads/";

    @GetMapping
    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    // Department ID ke basis par resources fetch karne ke liye endpoint
    @GetMapping("/department/{departmentId}")
    public List<Resource> getResourcesByDepartment(@PathVariable Long departmentId) {
        return resourceRepository.findByDepartmentId(departmentId);
    }
    
    @PostMapping
    public Resource uploadResource(
            @RequestParam("title") String title,
            @RequestParam("departmentId") Long departmentId,
            @RequestParam(value = "teacherId", required = false) Long teacherId,
            @RequestParam("type") String type,
            @RequestParam(value = "url", required = false) String url,
            @RequestParam(value = "file", required = false) MultipartFile file) {

        Resource resource = new Resource();
        resource.setTitle(title);
        resource.setDepartmentId(departmentId);
        resource.setTeacherId(teacherId);

        if ("youtube".equals(type)) {
            resource.setFileUrl(url);
        } else if (file != null && !file.isEmpty()) {
            try {
                File dir = new File(UPLOAD_DIR);
                if (!dir.exists()) {
                    dir.mkdirs();
                }

                String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                Path filePath = Paths.get(UPLOAD_DIR + fileName);
                Files.copy(file.getInputStream(), filePath);

                resource.setFileUrl("/uploads/" + fileName);

            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        return resourceRepository.save(resource);
    }

    // Update Resource Title / Department
    @PutMapping("/{id}")
    public ResponseEntity<Resource> updateResource(@PathVariable Long id, @RequestBody Resource updatedResource) {
        return resourceRepository.findById(id).map(resource -> {
            if (updatedResource.getTitle() != null) {
                resource.setTitle(updatedResource.getTitle());
            }
            if (updatedResource.getDepartmentId() != null) {
                resource.setDepartmentId(updatedResource.getDepartmentId());
            }
            Resource saved = resourceRepository.save(resource);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    // Delete Resource
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        return resourceRepository.findById(id).map(resource -> {
            // Server directory se physical file delete karna (agar uploaded file ho)
            if (resource.getFileUrl() != null && resource.getFileUrl().startsWith("/uploads/")) {
                try {
                    String fileName = resource.getFileUrl().replace("/uploads/", "");
                    Path filePath = Paths.get(UPLOAD_DIR + fileName);
                    Files.deleteIfExists(filePath);
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
            resourceRepository.delete(resource);
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }
}