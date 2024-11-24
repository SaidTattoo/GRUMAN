import { NavItem } from '../../vertical/sidebar/nav-item/nav-item';


//obtener aca en currentuser del lcoalstorage el profile y si es admin o user 


const currentUserString = localStorage.getItem('currentUser');
let currentUser: any = null;

if (currentUserString) {
  try {
    currentUser = JSON.parse(currentUserString);
  } catch (error) {
    console.error('Error parsing currentUser from localStorage', error);
  }
}

// Función para verificar si el cliente tiene "gruman" entre sus compañías
const hasGrumanCompany = (user: any): boolean => {
  if (!user || !user.companies) {
    return false;
  }
  return user.companies.some((company: any) =>
    company.nombre === 'GRUMAN'
  );
};

// Condición para mostrar "Mantenedores"
const showMantenedores = hasGrumanCompany(currentUser);



export const navItems: NavItem[] = [
  {
    navCap: 'Admin',
    children: [
      {
        displayName: 'Users',
        iconName: 'users',
        route: 'admin/users',
      },
    ],
  },
  {
    navCap: 'Home',
  },
  {
    displayName: 'Escritorio',
    iconName: 'home',
    route: 'dashboards/dashboard1',
    bgcolor: 'primary',

  },{
    displayName: 'Programación',
    iconName: 'calendar',
    children: [
      {
        displayName: 'Generar Programación',
        iconName: 'home-shield',
        bgcolor: 'primary',
        route: 'reportes/generar-programacion',
      },
      {
        displayName: 'Listado de Programación',
        iconName: 'home-shield',
        bgcolor: 'primary',
        route: 'transacciones/listado-programacion',
      },
      {
        displayName: 'Solicitud de aprobación de correctiva',
        iconName: 'home-shield',
        bgcolor: 'primary',
        route: 'transacciones/solicitud-aprobacion-correctiva',
      },
      {
        displayName: 'Listado de solicitudes de aprobación de correctiva',
        iconName: 'home-shield',
        bgcolor: 'primary',
        route: 'transacciones/listado-solicitud-aprobacion-correctiva',
      },
    ]
  },{
    displayName: 'Servicios realizados',
    iconName: 'home-shield',
    bgcolor: 'primary',
    route: 'transacciones/servicios-realizados',
  },
  ...(showMantenedores
    ? [
        {
          displayName: 'Mantenedores',
          iconName: 'home-shield',
          route: 'mantenedores',
          children: [
            {
              displayName: 'Locales',
              iconName: 'home-shield',
              route: 'mantenedores/locales',
            },{
              displayName: 'Moviles',
              iconName: 'home-shield',
              route: 'mantenedores/vehiculos',
            },
            {
              displayName: 'Tipo Activo',
              iconName: 'home-shield',
              route: 'mantenedores/tipo-activo',
            },
            {
              displayName: 'Tecnicos',
              iconName: 'home-shield',
              route: 'mantenedores/tecnicos',
            },
            {
              displayName: 'Repuestos',
              iconName: 'home-shield',
              route: 'mantenedores/repuestos',
            },
            {
              displayName: 'Clientes',
              iconName: 'home-shield',
              route: 'mantenedores/clientes',
            },
            {
              displayName: 'Cliente Usuarios',
              iconName: 'home-shield',
              route: 'mantenedores/cliente-usuarios',
            },
            {
              displayName: 'Listado de Documentos',
              iconName: 'home-shield',
              route: 'mantenedores/documentos',
            },
            {
              displayName: 'Tipo Documento',
              iconName: 'home-shield',
              route: 'mantenedores/documentos/tipo-documento',
            },
            {
              displayName: 'Tipo Servicio',
              iconName: 'home-shield',
              route: 'mantenedores/tipo-servicio',
            },
            {
              displayName: 'Sectores de Trabajo',
              iconName: 'home-shield',
              route: 'mantenedores/sectores-trabajo',
            },
            {
              displayName: 'Servicios',
              iconName: 'home-shield',
              route: 'mantenedores/servicios',
            },
          ],
        },
      ]
    : []),
];
