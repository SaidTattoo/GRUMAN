## Añadir columna para verificar que requiere de checklist

```SQL
ALTER TABLE gruman.activo_fijo_local ADD require_checklist BOOL DEFAULT FALSE NOT NULL;
ALTER TABLE gruman.activo_fijo_local ADD checklist_id INT DEFAULT NULL NULL;

ALTER TABLE gruman.activo_fijo_local ADD CONSTRAINT activo_fijo_local_section_FK FOREIGN KEY (checklist_id) REFERENCES gruman.`section`(id);
```
