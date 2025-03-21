class ChecklistClima {
  final int? id;
  final int solicitudId;
  final int activoFijoId;
  final String fecha;
  final String horaInicio;
  final String horaTermino;
  final String? movil;
  final Map<String, dynamic> verificacionServicio;
  final Map<String, dynamic> medicionRendimiento;
  final Map<String, dynamic> consumoElectrico;
  final String? observacionesGenerales;
  final Map<String, dynamic> firmaTecnico;
  final Map<String, dynamic> firmaCliente;

  ChecklistClima({
    this.id,
    required this.solicitudId,
    required this.activoFijoId,
    required this.fecha,
    required this.horaInicio,
    required this.horaTermino,
    this.movil,
    required this.verificacionServicio,
    required this.medicionRendimiento,
    required this.consumoElectrico,
    this.observacionesGenerales,
    required this.firmaTecnico,
    required this.firmaCliente,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'solicitudId': solicitudId,
    'activoFijoId': activoFijoId,
    'fecha': fecha,
    'horaInicio': horaInicio,
    'horaTermino': horaTermino,
    'movil': movil,
    'verificacionServicio': verificacionServicio,
    'medicionRendimiento': medicionRendimiento,
    'consumoElectrico': consumoElectrico,
    'observacionesGenerales': observacionesGenerales,
    'firmaTecnico': firmaTecnico,
    'firmaCliente': firmaCliente,
  };

  factory ChecklistClima.fromJson(Map<String, dynamic> json) => ChecklistClima(
    id: json['id'],
    solicitudId: json['solicitudId'],
    activoFijoId: json['activoFijoId'],
    fecha: json['fecha'],
    horaInicio: json['horaInicio'],
    horaTermino: json['horaTermino'],
    movil: json['movil'],
    verificacionServicio: json['verificacionServicio'],
    medicionRendimiento: json['medicionRendimiento'],
    consumoElectrico: json['consumoElectrico'],
    observacionesGenerales: json['observacionesGenerales'],
    firmaTecnico: json['firmaTecnico'],
    firmaCliente: json['firmaCliente'],
  );
} 