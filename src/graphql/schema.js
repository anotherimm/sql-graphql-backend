const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLEnumType,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLList,
  GraphQLNonNull,
  GraphQLInputObjectType,
} = require("graphql");
const resolvers = require("./resolvers");

// enum dan types
const UserRoleEnum = new GraphQLEnumType({
  name: "UserRole",
  values: {
    OPERATOR: { value: "OPERATOR" },
    VERIFIKATOR: { value: "VERIFIKATOR" },
  },
});

const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    username: { type: new GraphQLNonNull(GraphQLString) },
    role: { type: new GraphQLNonNull(UserRoleEnum) },
    kode_unit: { type: new GraphQLNonNull(GraphQLString) },
  }),
});

const ProvinsiType = new GraphQLObjectType({
  name: "Provinsi",
  fields: {
    id: { type: GraphQLID },
    nama: { type: GraphQLString },
    kode: { type: GraphQLString },
  },
});
const KotaType = new GraphQLObjectType({
  name: "Kota",
  fields: {
    id: { type: GraphQLID },
    nama: { type: GraphQLString },
    provinsi_id: { type: GraphQLInt },
  },
});
const KategoriAcaraType = new GraphQLObjectType({
  name: "KategoriAcara",
  fields: {
    id: { type: GraphQLID },
    nama: { type: GraphQLString },
    is_active: { type: GraphQLBoolean },
  },
});

const EventPermissionType = new GraphQLObjectType({
  name: "EventPermission",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    nama_acara: { type: new GraphQLNonNull(GraphQLString) },
    penyelenggara: { type: new GraphQLNonNull(GraphQLString) },
    jumlah_peserta: { type: new GraphQLNonNull(GraphQLInt) },
    tanggal_mulai: { type: new GraphQLNonNull(GraphQLString) },
    tanggal_selesai: { type: new GraphQLNonNull(GraphQLString) },
    lokasi: { type: new GraphQLNonNull(GraphQLString) },
    verified_at: { type: GraphQLString },
    verified_by: { type: GraphQLString },
    author: { type: UserType, resolve: resolvers.EventPermission.author },
    provinsi: {
      type: ProvinsiType,
      resolve: resolvers.EventPermission.provinsi,
    },
    kota: { type: KotaType, resolve: resolvers.EventPermission.kota },
  }),
});

const LoginResponseType = new GraphQLObjectType({
  name: "LoginResponse",
  fields: () => ({
    user: { type: new GraphQLNonNull(UserType) },
    token: { type: new GraphQLNonNull(GraphQLString) },
  }),
});
const EventPermissionListResponseType = new GraphQLObjectType({
  name: "EventPermissionListResponse",
  fields: () => ({
    data: { type: new GraphQLList(new GraphQLNonNull(EventPermissionType)) },
    total: { type: new GraphQLNonNull(GraphQLInt) },
    totalFiltered: { type: new GraphQLNonNull(GraphQLInt) },
  }),
});

// input types
const LoginInputType = new GraphQLInputObjectType({
  name: "LoginInput",
  fields: () => ({
    username: { type: new GraphQLNonNull(GraphQLString) },
    password: { type: new GraphQLNonNull(GraphQLString) },
  }),
});
const CreateUserInputType = new GraphQLInputObjectType({
  name: "CreateUserInput",
  fields: () => ({
    username: { type: new GraphQLNonNull(GraphQLString) },
    password: { type: new GraphQLNonNull(GraphQLString) },
    role: { type: new GraphQLNonNull(UserRoleEnum) },
    kode_unit: { type: new GraphQLNonNull(GraphQLString) },
  }),
});
const CreateProvinsiInputType = new GraphQLInputObjectType({
  name: "CreateProvinsiInput",
  fields: () => ({
    nama: { type: new GraphQLNonNull(GraphQLString) },
    kode: { type: new GraphQLNonNull(GraphQLString) },
  }),
});
const CreateKotaInputType = new GraphQLInputObjectType({
  name: "CreateKotaInput",
  fields: () => ({
    nama: { type: new GraphQLNonNull(GraphQLString) },
    kode: { type: new GraphQLNonNull(GraphQLString) },
    provinsi_id: { type: new GraphQLNonNull(GraphQLInt) },
  }),
});
const CreateKategoriAcaraInputType = new GraphQLInputObjectType({
  name: "CreateKategoriAcaraInput",
  fields: () => ({
    nama: { type: new GraphQLNonNull(GraphQLString) },
    kode: { type: new GraphQLNonNull(GraphQLString) },
    deskripsi: { type: GraphQLString },
  }),
});
const EventPermissionInputType = new GraphQLInputObjectType({
  name: "EventPermissionInput",
  fields: () => ({
    nama_acara: { type: new GraphQLNonNull(GraphQLString) },
    penyelenggara: { type: new GraphQLNonNull(GraphQLString) },
    jumlah_peserta: { type: new GraphQLNonNull(GraphQLInt) },
    tanggal_mulai: { type: new GraphQLNonNull(GraphQLString) },
    tanggal_selesai: { type: new GraphQLNonNull(GraphQLString) },
    lokasi: { type: new GraphQLNonNull(GraphQLString) },
    provinsi_id: { type: new GraphQLNonNull(GraphQLInt) },
    kota_id: { type: new GraphQLNonNull(GraphQLInt) },
    kategori_acara_id: { type: new GraphQLNonNull(GraphQLInt) },
  }),
});
const PaginationInputType = new GraphQLInputObjectType({
  name: "PaginationInput",
  fields: () => ({
    take: { type: GraphQLInt, defaultValue: 10 },
    skip: { type: GraphQLInt, defaultValue: 0 },
    search: { type: GraphQLString },
  }),
});

//root query
const RootQuery = new GraphQLObjectType({
  name: "Query",
  fields: {
    getEventPermissionList: {
      type: new GraphQLNonNull(EventPermissionListResponseType),
      args: { pagination: { type: PaginationInputType } },
      resolve: resolvers.getEventPermissionList,
    },
    getEventPermissionVerifikasiList: {
      type: new GraphQLNonNull(EventPermissionListResponseType),
      args: { pagination: { type: PaginationInputType } },
      resolve: resolvers.getEventPermissionVerifikasiList,
    },
    getProvinsi: {
      type: new GraphQLList(ProvinsiType),
      resolve: resolvers.getProvinsi,
    },
    getKota: {
      type: new GraphQLList(KotaType),
      args: { provinsiId: { type: new GraphQLNonNull(GraphQLInt) } },
      resolve: resolvers.getKota,
    },
    getKategoriAcara: {
      type: new GraphQLList(KategoriAcaraType),
      resolve: resolvers.getKategoriAcara,
    },
  },
});

//root mutation
const RootMutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    login: {
      type: LoginResponseType,
      args: { input: { type: new GraphQLNonNull(LoginInputType) } },
      resolve: resolvers.login,
    },
    createEventPermission: {
      type: EventPermissionType,
      args: { input: { type: new GraphQLNonNull(EventPermissionInputType) } },
      resolve: resolvers.createEventPermission,
    },
    updateEventPermission: {
      type: EventPermissionType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        input: { type: EventPermissionInputType },
      },
      resolve: resolvers.updateEventPermission,
    },
    deleteEventPermission: {
      type: GraphQLBoolean,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: resolvers.deleteEventPermission,
    },
    verifyEventPermission: {
      type: EventPermissionType,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: resolvers.verifyEventPermission,
    },
    // Admin Mutations
    createUser: {
      type: UserType,
      args: { input: { type: new GraphQLNonNull(CreateUserInputType) } },
      resolve: resolvers.createUser,
    },
    createProvinsi: {
      type: ProvinsiType,
      args: { input: { type: new GraphQLNonNull(CreateProvinsiInputType) } },
      resolve: resolvers.createProvinsi,
    },
    createKota: {
      type: KotaType,
      args: { input: { type: new GraphQLNonNull(CreateKotaInputType) } },
      resolve: resolvers.createKota,
    },
    createKategoriAcara: {
      type: KategoriAcaraType,
      args: {
        input: { type: new GraphQLNonNull(CreateKategoriAcaraInputType) },
      },
      resolve: resolvers.createKategoriAcara,
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation,
});
