import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const roleSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  permissions: z.array(z.number()),
});

export const roleRoutes: FastifyPluginAsync = async (fastify) => {
  // Obtener todos los roles
  fastify.get('/', async (request, reply) => {
    try {
      const roles = await fastify.db.query(
        `SELECT 
          r.id,
          r.name,
          r.description,
          r.is_system,
          COUNT(ur.user_id) as user_count,
          array_agg(p.id) as permission_ids,
          array_agg(p.name) as permission_names
         FROM roles r
         LEFT JOIN user_roles ur ON r.id = ur.role_id
         LEFT JOIN role_permissions rp ON r.id = rp.role_id
         LEFT JOIN permissions p ON rp.permission_id = p.id
         GROUP BY r.id
         ORDER BY r.name`
      );

      return roles.map(role => ({
        id: role.id,
        name: role.name,
        description: role.description,
        isSystem: role.is_system,
        userCount: parseInt(role.user_count),
        permissions: role.permission_ids.map((id, index) => ({
          id,
          name: role.permission_names[index],
        })),
      }));
    } catch (error) {
      fastify.log.error(error);
      throw new Error('Error al obtener roles');
    }
  });

  // Crear nuevo rol
  fastify.post('/', async (request, reply) => {
    const role = roleSchema.parse(request.body);

    try {
      const result = await fastify.db.query(
        `INSERT INTO roles (name, description)
         VALUES ($1, $2)
         RETURNING id`,
        [role.name, role.description]
      );

      const roleId = result[0].id;

      // Asignar permisos
      if (role.permissions.length > 0) {
        const values = role.permissions.map(permissionId => `(${roleId}, ${permissionId})`).join(',');
        await fastify.db.query(
          `INSERT INTO role_permissions (role_id, permission_id)
           VALUES ${values}`
        );
      }

      return { id: roleId };
    } catch (error) {
      fastify.log.error(error);
      throw new Error('Error al crear rol');
    }
  });

  // Actualizar rol
  fastify.put('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const role = roleSchema.parse(request.body);

    try {
      // Verificar si el rol es del sistema
      const existingRole = await fastify.db.query(
        `SELECT is_system FROM roles WHERE id = $1`,
        [id]
      );

      if (existingRole.length === 0) {
        return reply.status(404).send({ error: 'Rol no encontrado' });
      }

      if (existingRole[0].is_system) {
        return reply.status(403).send({ error: 'No se puede modificar un rol del sistema' });
      }

      // Actualizar rol
      await fastify.db.query(
        `UPDATE roles
         SET name = $1, description = $2
         WHERE id = $3`,
        [role.name, role.description, id]
      );

      // Actualizar permisos
      await fastify.db.query(
        `DELETE FROM role_permissions WHERE role_id = $1`,
        [id]
      );

      if (role.permissions.length > 0) {
        const values = role.permissions.map(permissionId => `(${id}, ${permissionId})`).join(',');
        await fastify.db.query(
          `INSERT INTO role_permissions (role_id, permission_id)
           VALUES ${values}`
        );
      }

      return { success: true };
    } catch (error) {
      fastify.log.error(error);
      throw new Error('Error al actualizar rol');
    }
  });

  // Eliminar rol
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      // Verificar si el rol es del sistema
      const existingRole = await fastify.db.query(
        `SELECT is_system FROM roles WHERE id = $1`,
        [id]
      );

      if (existingRole.length === 0) {
        return reply.status(404).send({ error: 'Rol no encontrado' });
      }

      if (existingRole[0].is_system) {
        return reply.status(403).send({ error: 'No se puede eliminar un rol del sistema' });
      }

      // Eliminar asignaciones de usuarios y permisos
      await fastify.db.query(
        `DELETE FROM user_roles WHERE role_id = $1;
         DELETE FROM role_permissions WHERE role_id = $1;
         DELETE FROM roles WHERE id = $1`,
        [id]
      );

      return { success: true };
    } catch (error) {
      fastify.log.error(error);
      throw new Error('Error al eliminar rol');
    }
  });

  // Asignar usuarios a un rol
  fastify.put('/:id/users', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { userIds } = z.object({ userIds: z.array(z.number()) }).parse(request.body);

    try {
      // Eliminar asignaciones existentes
      await fastify.db.query(
        `DELETE FROM user_roles WHERE role_id = $1`,
        [id]
      );

      // Asignar nuevos usuarios
      if (userIds.length > 0) {
        const values = userIds.map(userId => `(${userId}, ${id})`).join(',');
        await fastify.db.query(
          `INSERT INTO user_roles (user_id, role_id)
           VALUES ${values}`
        );
      }

      return { success: true };
    } catch (error) {
      fastify.log.error(error);
      throw new Error('Error al asignar usuarios al rol');
    }
  });
}; 