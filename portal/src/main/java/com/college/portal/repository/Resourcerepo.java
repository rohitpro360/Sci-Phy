package com.college.portal.repository;

import com.college.portal.model.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface Resourcerepo extends JpaRepository<Resource, Long> {
    List<Resource> findBySubjectId(Long subjectId);
    List<Resource> findByDepartmentId(Long departmentId);
    List<Resource> findByTeacherId(Long teacherId);
}