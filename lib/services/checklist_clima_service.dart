import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/checklist_clima.dart';
import '../config/environment.dart';

class ChecklistClimaService {
  final String baseUrl = '${Environment.apiUrl}/checklist-clima';

  Future<ChecklistClima> createChecklist(ChecklistClima checklist) async {
    try {
      final response = await http.post(
        Uri.parse(baseUrl),
        headers: {
          'Content-Type': 'application/json',
          // Agrega aquí headers adicionales si necesitas (ej: autorización)
          // 'Authorization': 'Bearer $token',
        },
        body: jsonEncode(checklist.toJson()),
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        return ChecklistClima.fromJson(jsonDecode(response.body));
      } else {
        throw Exception('Error al crear el checklist: ${response.body}');
      }
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }

  Future<List<ChecklistClima>> getChecklistsBySolicitud(int solicitudId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/solicitud/$solicitudId'),
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        List<dynamic> body = jsonDecode(response.body);
        return body.map((item) => ChecklistClima.fromJson(item)).toList();
      } else {
        throw Exception('Error al obtener los checklists: ${response.body}');
      }
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }

  Future<ChecklistClima> updateChecklist(
      int id, ChecklistClima checklist) async {
    try {
      final response = await http.put(
        Uri.parse('$baseUrl/$id'),
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': 'Bearer $token',
        },
        body: jsonEncode(checklist.toJson()),
      );

      if (response.statusCode == 200) {
        return ChecklistClima.fromJson(jsonDecode(response.body));
      } else {
        throw Exception('Error al actualizar el checklist: ${response.body}');
      }
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }
}
