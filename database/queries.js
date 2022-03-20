module.exports = {
    
    getAllUsers: `select Nombre, Usuario from APPIA_INFO.dbo.Usuarios order by Nombre`,
    getAllUsersIn: `select Nombre, Usuario from APPIA_INFO.dbo.Usuarios where Usuario in (@userList) order by Nombre`,
    getUsername: `select Nombre from APPIA_INFO.dbo.Usuarios where Usuario = @usuario`,
    //newUser: 'insert into users (name, email, pass) values (@name, @email, @pass)',
    getUserPass: 'select Contrasena from APPIA_INFO.dbo.Usuarios where Usuario = @name',
    getAllEmpresas: 'select Empresa from APPIA_INFO.dbo.Empresas where Estilo = 18 order by Empresa',

    //REAPROVECHAR
    setControlUsuario2: 'update APPIA_SQL.dbo.PackingList set ControlUsuario2= @usuario, ControlFecha2 = getdate() where Empresa = @Empresa and NumeroDePackingList = @PLE',
    setEstiloAE: `update APPIA_SQL.dbo.PackingList set Estilo = @Estilo where NumeroDePackingList = @NumeroDePackingList`,

    getAllServicios: `SELECT CodigoDeServicio as Codigo, Descripcion1 as Descripcion,isnull(PrecioDeVentaDB1,0) as Precio,CodigoDeGrupo1 as Grupo FROM APPIA_SQL.dbo.Servicios WHERE CodigoDeGrupo1 = @Empresa or CodigoDeGrupo1 = 'TODOS' order by Descripcion1`,
    getAllServiciosOperator: `SELECT CodigoDeServicio as Codigo, Descripcion1 as Descripcion,isnull(PrecioDeVentaDB1,0) as Precio,CodigoDeGrupo1 as Grupo FROM APPIA_SQL.dbo.Servicios WHERE CodigoDeGrupo1 = @Empresa order by Descripcion1`,
    getEmpresaTipo: `select tipodeempresa from APPIA_SQL.dbo.CopiaDeEmpresas where Empresa = @empresa`,
    getServicioDescByPk: `select Descripcion1 FROM APPIA_SQL.dbo.Servicios WHERE CodigoDeServicio = @Codigo`,
    getServicioPrecioByPk: `select isnull(PrecioDeVentaDB1,0) as Precio FROM APPIA_SQL.dbo.Servicios WHERE CodigoDeServicio = @Codigo`,

    
}