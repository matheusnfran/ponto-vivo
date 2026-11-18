
import 'react-native-url-polyfill/auto';
import React, {
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';

import {
  AccessibilityInfo,
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { createClient } from '@supabase/supabase-js';

/* CONFIGURAÇÃO */

const URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const db = URL && KEY
  ? createClient(URL, KEY)
  : null;

/* IDENTIDADE VISUAL */

const PRIMARY = '#087C69';
const INK = '#122F2B';
const MUTED = '#5B726C';
const BACKGROUND = '#F4F8F6';
const BORDER = 'rgba(255,255,255,0.88)';

const CATEGORIES = [
  'Iluminação',
  'Estrutura',
  'Acessibilidade',
  'Segurança',
  'Outros'
];

const STATUS = {
  'Pendente': {
    color: '#98640B',
    background: '#FFF3D7',
    border: '#F1DCA4'
  },
  'Em análise': {
    color: '#245EAD',
    background: '#E8F1FF',
    border: '#CFDFFA'
  },
  'Resolvido': {
    color: '#147351',
    background: '#E4F6EB',
    border: '#C8EAD8'
  }
};

const fmt = date =>
  new Date(date).toLocaleDateString('pt-BR');

/* COMPONENTE DE STATUS */

function StatusBadge({ status }) {
  const current = STATUS[status] || {
    color: INK,
    background: '#EDF2EF',
    border: '#DAE7DF'
  };

  return (
    <View
      style={[
        styles.statusBadge,
        {
          backgroundColor: current.background,
          borderColor: current.border
        }
      ]}
    >
      <View
        style={[
          styles.statusDot,
          { backgroundColor: current.color }
        ]}
      />

      <Text
        style={[
          styles.statusText,
          { color: current.color }
        ]}
      >
        {status}
      </Text>
    </View>
  );
}

/* CARD DE OCORRÊNCIA */

function IssueCard({
  item,
  onPress,
  reducedMotion
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const animate = value => {
    if (reducedMotion) return;

    Animated.timing(scale, {
      toValue: value,
      duration: 150,
      useNativeDriver: true
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.cardOuter,
        { transform: [{ scale }] }
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          `${item.titulo}, status ${item.status}, ver detalhes`
        }
        onPress={onPress}
        onPressIn={() => animate(0.985)}
        onPressOut={() => animate(1)}
      >
        <LinearGradient
          colors={[
            'rgba(255,255,255,0.98)',
            'rgba(237,248,243,0.88)'
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.cardTop}>
            <Text style={styles.category}>
              {item.categoria.toUpperCase()}
            </Text>

            <StatusBadge status={item.status} />
          </View>

          <Text style={styles.cardTitle}>
            {item.titulo}
          </Text>

          <View style={styles.locationRow}>
            <View style={styles.locationDot} />

            <Text style={styles.meta}>
              {item.localizacao}
            </Text>
          </View>

          <View style={styles.cardFooter}>
            <Text style={styles.date}>
              {fmt(item.criado_em)}
            </Text>

            <Text style={styles.detailLink}>
              Ver detalhes
            </Text>
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

/* COMPONENTE PRINCIPAL */

export default function App() {
  const [screen, setScreen] = useState('lista');
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);

  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [reducedMotion, setReducedMotion] = useState(false);

  const [form, setForm] = useState({
    titulo: '',
    descricao: '',
    localizacao: '',
    categoria: 'Estrutura'
  });

  /* ACESSIBILIDADE DE MOVIMENTO */

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then(setReducedMotion)
      .catch(() => {});

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReducedMotion
    );

    return () => subscription.remove();
  }, []);

  /* FORMULÁRIO */

  const update = (key, value) => {
    setForm(previous => ({
      ...previous,
      [key]: value
    }));
  };

  /* CONSULTA SUPABASE */

  const load = useCallback(async (silent = false) => {
    if (!db) {
      setError(
        'Configure o arquivo .env com as credenciais públicas do Supabase.'
      );
      return;
    }

    if (!silent) setLoading(true);

    try {
      const { data, error: dbError } = await db
        .from('ocorrencias')
        .select('*')
        .order('criado_em', { ascending: false })
        .limit(100);

      if (dbError) throw dbError;

      const records = data || [];

      setItems(records);
      setError('');

      setSelected(previous => {
        if (!previous) return null;

        return records.find(
          item => item.id === previous.id
        ) || previous;
      });

    } catch (e) {
      setError(
        'Não foi possível carregar as ocorrências. Verifique a conexão.'
      );
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();

    const interval = setInterval(
      () => load(true),
      12000
    );

    return () => clearInterval(interval);
  }, [load]);

  /* ENVIO DE OCORRÊNCIA */

  const submit = async () => {
    if (sending) return;

    if (
      form.titulo.trim().length < 5 ||
      form.descricao.trim().length < 10 ||
      form.localizacao.trim().length < 5
    ) {
      Alert.alert(
        'Confira os campos',
        'Preencha título (5+ caracteres), descrição (10+) e localização (5+).'
      );
      return;
    }

    if (!db) {
      Alert.alert(
        'Configuração necessária',
        'Conecte o projeto ao Supabase.'
      );
      return;
    }

    setSending(true);

    try {
      const { error: dbError } = await db
        .from('ocorrencias')
        .insert({
          titulo: form.titulo.trim(),
          descricao: form.descricao.trim(),
          localizacao: form.localizacao.trim(),
          categoria: form.categoria
        });

      if (dbError) throw dbError;

      setForm({
        titulo: '',
        descricao: '',
        localizacao: '',
        categoria: 'Estrutura'
      });

      setSuccess(
        'Ocorrência enviada! Ela já poderá ser vista no painel web.'
      );

      AccessibilityInfo.announceForAccessibility(
        'Ocorrência registrada com sucesso'
      );

      setScreen('lista');
      await load();

    } catch (e) {
      Alert.alert(
        'Falha ao enviar',
        'Não foi possível salvar a ocorrência. Tente novamente.'
      );
    } finally {
      setSending(false);
    }
  };

  /* NAVEGAÇÃO */

  const openList = () => {
    setScreen('lista');
    setSuccess('');
  };

  const openForm = () => {
    setScreen('novo');
    setSuccess('');
  };

  /* INTERFACE */

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#E5F4EB"
      />

      {/* CABEÇALHO COM DEGRADÊ */}

      <LinearGradient
        colors={[
          '#E1F3E9',
          '#ECF8F1',
          '#F4F8F6'
        ]}
        locations={[0, 0.65, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerDecorationOne} />
        <View style={styles.headerDecorationTwo} />

        <View style={styles.headerContent}>
          <Text style={styles.eyebrow}>
            CIDADE EM MOVIMENTO
          </Text>

          <View style={styles.brandRow}>
  <Image
    source={require('./logopontovivomb.png')}
    style={styles.logoImage}
    resizeMode="contain"
    accessibilityLabel="Ponto Vivo"
  />

  <Image
    source={require('./robomb.png')}
    style={styles.robotImage}
    resizeMode="contain"
    accessibilityLabel="Mascote Ponto Vivo"
  />
</View>

          <Text style={styles.subtitle}>
            Melhores pontos começam com a sua voz.
          </Text>
        </View>
      </LinearGradient>

      {!db && (
        <Text style={styles.warning}>
          Demonstração desconectada: configure mobile/.env.
        </Text>
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={
          Platform.OS === 'ios' ? 'padding' : undefined
        }
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.contentInner}>

            {/* TELA DE OCORRÊNCIAS */}

            {screen === 'lista' && (
              <>
                <View style={styles.sectionHeading}>
                  <Text style={styles.sectionEyebrow}>
                    COMUNIDADE
                  </Text>

                  <Text
                    accessibilityRole="header"
                    style={styles.h1}
                  >
                    Ocorrências da comunidade
                  </Text>

                  <Text style={styles.paragraph}>
                    Acompanhe relatos e veja o andamento
                    das melhorias.
                  </Text>
                </View>

                {!!success && (
                  <View style={styles.successBox}>
                    <View style={styles.successDot} />

                    <Text
                      accessibilityRole="alert"
                      style={styles.successText}
                    >
                      {success}
                    </Text>
                  </View>
                )}

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Atualizar ocorrências"
                  onPress={() => load()}
                  style={({ pressed }) => [
                    styles.secondary,
                    pressed && styles.pressed
                  ]}
                >
                  <Text style={styles.secondaryText}>
                    Atualizar lista
                  </Text>
                </Pressable>

                {loading && (
                  <ActivityIndicator
                    color={PRIMARY}
                    style={styles.loader}
                  />
                )}

                {!!error && (
                  <Text
                    accessibilityRole="alert"
                    style={styles.warning}
                  >
                    {error}
                  </Text>
                )}

                {!loading && items.length === 0 && (
                  <View style={styles.emptyCard}>
                    <View style={styles.emptyCircle}>
                      <View style={styles.emptyCircleInner} />
                    </View>

                    <Text style={styles.emptyTitle}>
                      Nenhuma ocorrência ainda
                    </Text>

                    <Text style={styles.emptyText}>
                      Seja a primeira pessoa a contribuir
                      com melhorias para a comunidade.
                    </Text>

                    <Pressable
                      accessibilityRole="button"
                      onPress={openForm}
                      style={styles.emptyButton}
                    >
                      <Text style={styles.emptyButtonText}>
                        Registrar problema
                      </Text>
                    </Pressable>
                  </View>
                )}

                {items.map(item => (
                  <IssueCard
                    key={item.id}
                    item={item}
                    reducedMotion={reducedMotion}
                    onPress={() => {
                      setSelected(item);
                      setScreen('detalhe');
                      setSuccess('');
                    }}
                  />
                ))}
              </>
            )}

            {/* TELA DE REGISTRO */}

            {screen === 'novo' && (
              <>
                <View style={styles.sectionHeading}>
                  <Text style={styles.sectionEyebrow}>
                    PARTICIPE
                  </Text>

                  <Text
                    accessibilityRole="header"
                    style={styles.h1}
                  >
                    Registrar problema
                  </Text>

                  <Text style={styles.paragraph}>
                    Conte o que está acontecendo em
                    um ponto de ônibus.
                  </Text>
                </View>

                <LinearGradient
                  colors={[
                    'rgba(255,255,255,0.98)',
                    'rgba(237,248,243,0.92)'
                  ]}
                  style={styles.formCard}
                >
                  <Text style={styles.formCardTitle}>
                    Novo relato
                  </Text>

                  <Text style={styles.formCardSubtitle}>
                    Preencha as informações abaixo.
                  </Text>

                  <Text style={styles.label}>
                    Título *
                  </Text>

                  <TextInput
                    accessibilityLabel="Título da ocorrência"
                    maxLength={100}
                    value={form.titulo}
                    onChangeText={v => update('titulo', v)}
                    placeholder="Ex.: Lâmpada apagada"
                    placeholderTextColor="#71877D"
                    style={styles.input}
                  />

                  <Text style={styles.label}>
                    Categoria *
                  </Text>

                  <View style={styles.chips}>
                    {CATEGORIES.map(category => {
                      const active =
                        form.categoria === category;

                      return (
                        <Pressable
                          key={category}
                          accessibilityRole="radio"
                          accessibilityState={{
                            selected: active
                          }}
                          onPress={() =>
                            update('categoria', category)
                          }
                          style={[
                            styles.chip,
                            active && styles.chipActive
                          ]}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              active && styles.chipTextActive
                            ]}
                          >
                            {category}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  <Text style={styles.label}>
                    Localização aproximada *
                  </Text>

                  <TextInput
                    accessibilityLabel="Localização aproximada"
                    maxLength={140}
                    value={form.localizacao}
                    onChangeText={v =>
                      update('localizacao', v)
                    }
                    placeholder="Rua, bairro ou referência"
                    placeholderTextColor="#71877D"
                    style={styles.input}
                  />

                  <Text style={styles.label}>
                    Descrição *
                  </Text>

                  <TextInput
                    accessibilityLabel="Descrição do problema"
                    maxLength={500}
                    multiline
                    textAlignVertical="top"
                    value={form.descricao}
                    onChangeText={v =>
                      update('descricao', v)
                    }
                    placeholder="Descreva o problema com detalhes"
                    placeholderTextColor="#71877D"
                    style={[
                      styles.input,
                      styles.multiline
                    ]}
                  />

                  <View style={styles.privacyBox}>
                    <Text style={styles.privacyText}>
                      Não inclua nome, telefone ou
                      outros dados pessoais.
                    </Text>
                  </View>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{
                      disabled: sending
                    }}
                    disabled={sending}
                    onPress={submit}
                    style={({ pressed }) => [
                      styles.button,
                      pressed && styles.buttonPressed,
                      sending && { opacity: 0.7 }
                    ]}
                  >
                    <LinearGradient
                      colors={['#087C69', '#0A9A7E']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.buttonGradient}
                    >
                      <Text style={styles.buttonText}>
                        {sending
                          ? 'Enviando...'
                          : 'Enviar ocorrência'}
                      </Text>
                    </LinearGradient>
                  </Pressable>
                </LinearGradient>
              </>
            )}

            {/* DETALHES */}

            {screen === 'detalhe' && selected && (
              <>
                <Pressable
                  accessibilityRole="button"
                  onPress={openList}
                  style={styles.back}
                >
                  <Text style={styles.secondaryText}>
                    Voltar à lista
                  </Text>
                </Pressable>

                <Text style={styles.sectionEyebrow}>
                  DETALHES DO RELATO
                </Text>

                <Text
                  accessibilityRole="header"
                  style={styles.h1}
                >
                  {selected.titulo}
                </Text>

                <View style={styles.detailBadgeRow}>
                  <StatusBadge
                    status={selected.status}
                  />
                </View>

                <LinearGradient
                  colors={[
                    'rgba(255,255,255,0.98)',
                    'rgba(237,248,243,0.9)'
                  ]}
                  style={styles.detailCard}
                >
                  <Text style={styles.detailLabel}>
                    CATEGORIA
                  </Text>

                  <Text style={styles.detailValue}>
                    {selected.categoria}
                  </Text>

                  <View style={styles.detailDivider} />

                  <Text style={styles.detailLabel}>
                    LOCALIZAÇÃO
                  </Text>

                  <Text style={styles.detailValue}>
                    {selected.localizacao}
                  </Text>

                  <View style={styles.detailDivider} />

                  <Text style={styles.detailLabel}>
                    DESCRIÇÃO
                  </Text>

                  <Text style={styles.detailValue}>
                    {selected.descricao}
                  </Text>

                  <View style={styles.detailDivider} />

                  <Text style={styles.detailLabel}>
                    REGISTRADO EM
                  </Text>

                  <Text style={styles.detailValue}>
                    {fmt(selected.criado_em)}
                  </Text>
                </LinearGradient>

                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>
                    O status é atualizado pelo painel
                    de gestão web. Os dados são
                    sincronizados periodicamente.
                  </Text>
                </View>
              </>
            )}

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* NAVEGAÇÃO INFERIOR */}

      <View style={styles.nav}>
        <View style={styles.navInner}>
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{
              selected: screen !== 'novo'
            }}
            onPress={openList}
            style={[
              styles.tab,
              screen !== 'novo' && styles.tabOn
            ]}
          >
            <Text
              style={[
                styles.navText,
                screen !== 'novo' && styles.navOn
              ]}
            >
              Ocorrências
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="tab"
            accessibilityState={{
              selected: screen === 'novo'
            }}
            onPress={openForm}
            style={[
              styles.tab,
              screen === 'novo' && styles.tabOn
            ]}
          >
            <Text
              style={[
                styles.navText,
                screen === 'novo' && styles.navOn
              ]}
            >
              Registrar
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

/* ESTILOS */

const styles = StyleSheet.create({

 brandRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  marginTop: -10
},

robotImage: {
  width: 112,
  height: 112,
  marginRight: 24
},

  root: {
    flex: 1,
    backgroundColor: BACKGROUND
  },

  /* CABEÇALHO */

  header: {
  paddingHorizontal: 24,
  paddingTop: Platform.OS === 'ios' ? 62 : 16,
  paddingBottom: 10,
  borderBottomLeftRadius: 25,
  borderBottomRightRadius: 25,
  overflow: 'hidden',
  borderBottomWidth: 1,
  borderBottomColor: 'rgba(255,255,255,0.8)'
},

  headerContent: {
    zIndex: 2,
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center'
  },

  headerDecorationOne: {
    position: 'absolute',
    width: 175,
    height: 175,
    borderRadius: 100,
    borderWidth: 22,
    borderColor: 'rgba(8,124,105,0.055)',
    right: -65,
    top: -85
  },

  headerDecorationTwo: {
    position: 'absolute',
    width: 95,
    height: 95,
    borderRadius: 60,
    borderWidth: 14,
    borderColor: 'rgba(8,124,105,0.045)',
    right: 18,
    bottom: -60
  },

  eyebrow: {
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '800',
    color: PRIMARY
  },

  logoImage: {
  width: 205,
  height: 46,
  flexShrink: 1
},

  subtitle: {
  fontSize: 13,
  lineHeight: 20,
  color: MUTED,
  marginTop: -24
},

  /* CONTEÚDO */

  content: {
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 45,
    flexGrow: 1
  },

  contentInner: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center'
  },

  sectionHeading: {
    marginBottom: 8
  },

  sectionEyebrow: {
    color: PRIMARY,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.8,
    marginBottom: 10
  },

  h1: {
    fontSize: 25,
    fontWeight: '800',
    letterSpacing: -0.7,
    color: INK,
    marginBottom: 9,
    lineHeight: 31
  },

  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    color: MUTED,
    marginBottom: 19
  },

  /* CARDS */

  cardOuter: {
    marginBottom: 14,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    shadowColor: '#166650',
    shadowOffset: {
      width: 0,
      height: 5
    },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 2
  },

  card: {
    borderRadius: 19,
    padding: 19,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden'
  },

  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8
  },

  category: {
    fontSize: 10,
    color: PRIMARY,
    fontWeight: '800',
    letterSpacing: 1,
    flexShrink: 1
  },

  cardTitle: {
    color: INK,
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 24,
    marginTop: 16,
    marginBottom: 12
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8
  },

  locationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: PRIMARY,
    marginTop: 5
  },

  meta: {
    fontSize: 13,
    color: MUTED,
    lineHeight: 19,
    flex: 1
  },

  cardFooter: {
    marginTop: 18,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(8,124,105,0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },

  date: {
    fontSize: 12,
    color: MUTED
  },

  detailLink: {
    fontSize: 12,
    fontWeight: '800',
    color: PRIMARY
  },

  /* STATUS */

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4
  },

  statusText: {
    fontSize: 11,
    fontWeight: '800'
  },

  /* BOTÕES */

  secondary: {
    minHeight: 46,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderWidth: 1,
    borderColor: 'rgba(8,124,105,0.24)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 19
  },

  secondaryText: {
    fontSize: 14,
    color: PRIMARY,
    fontWeight: '800'
  },

  pressed: {
    opacity: 0.76
  },

  button: {
    borderRadius: 13,
    marginTop: 22,
    overflow: 'hidden'
  },

  buttonGradient: {
    minHeight: 51,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 13
  },

  buttonPressed: {
    opacity: 0.85
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800'
  },

  /* FORMULÁRIO GLASS */

  formCard: {
    padding: 21,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: '#166650',
    shadowOffset: {
      width: 0,
      height: 5
    },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2
  },

  formCardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: INK,
    marginBottom: 4
  },

  formCardSubtitle: {
    fontSize: 13,
    color: MUTED,
    marginBottom: 12
  },

  label: {
    fontSize: 12,
    color: INK,
    fontWeight: '800',
    marginTop: 17,
    marginBottom: 8
  },

  input: {
    minHeight: 49,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#BDD4C9',
    backgroundColor: 'rgba(255,255,255,0.88)',
    paddingHorizontal: 14,
    fontSize: 15,
    color: INK
  },

  multiline: {
    height: 120,
    paddingTop: 14
  },

  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },

  chip: {
    minHeight: 43,
    justifyContent: 'center',
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#BDD4C9',
    backgroundColor: 'rgba(255,255,255,0.75)'
  },

  chipActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY
  },

  chipText: {
    color: INK,
    fontSize: 12,
    fontWeight: '700'
  },

  chipTextActive: {
    color: '#FFFFFF'
  },

  privacyBox: {
    padding: 12,
    marginTop: 17,
    borderRadius: 11,
    backgroundColor: 'rgba(8,124,105,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(8,124,105,0.09)'
  },

  privacyText: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 19
  },

  /* FEEDBACK */

  loader: {
    marginTop: 20
  },

  warning: {
    color: '#774D0E',
    backgroundColor: '#FFF1DA',
    borderRadius: 12,
    padding: 13,
    fontSize: 13,
    marginBottom: 14,
    overflow: 'hidden'
  },

  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderRadius: 13,
    padding: 14,
    backgroundColor: '#E3F4E9',
    borderWidth: 1,
    borderColor: '#C6E8D3',
    marginBottom: 15
  },

  successDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#16885E'
  },

  successText: {
    color: '#185E36',
    fontSize: 13,
    lineHeight: 19,
    flex: 1,
    fontWeight: '600'
  },

  /* ESTADO VAZIO */

  emptyCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.78)',
    paddingVertical: 34,
    paddingHorizontal: 24,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: BORDER
  },

  emptyCircle: {
    width: 65,
    height: 65,
    borderRadius: 33,
    borderWidth: 7,
    borderColor: '#C6E9D8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },

  emptyCircleInner: {
    width: 29,
    height: 29,
    borderRadius: 15,
    borderWidth: 5,
    borderColor: PRIMARY
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: INK,
    textAlign: 'center',
    marginBottom: 8
  },

  emptyText: {
    fontSize: 13,
    lineHeight: 21,
    textAlign: 'center',
    color: MUTED
  },

  emptyButton: {
    marginTop: 20,
    borderRadius: 10,
    backgroundColor: '#E3F4EA',
    minHeight: 44,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },

  emptyButtonText: {
    fontWeight: '800',
    color: PRIMARY,
    fontSize: 13
  },

  /* DETALHES */

  back: {
    paddingVertical: 12,
    alignSelf: 'flex-start',
    marginBottom: 15
  },

  detailBadgeRow: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 19
  },

  detailCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 21,
    overflow: 'hidden'
  },

  detailLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: PRIMARY,
    letterSpacing: 1.3,
    marginBottom: 9
  },

  detailValue: {
    color: INK,
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 8
  },

  detailDivider: {
    height: 1,
    backgroundColor: 'rgba(8,124,105,0.11)',
    marginVertical: 17
  },

  infoBox: {
    backgroundColor: 'rgba(225,242,233,0.75)',
    padding: 15,
    borderRadius: 13,
    marginTop: 18
  },

  infoText: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 20
  },

  /* NAVEGAÇÃO INFERIOR */

  nav: {
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderTopWidth: 1,
    borderTopColor: '#DDEBE6',
    paddingHorizontal: 12,
    paddingTop: 11,
    paddingBottom: Platform.OS === 'ios' ? 26 : 14
  },

  navInner: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 10
  },

  tab: {
    flex: 1,
    minHeight: 48,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center'
  },

  tabOn: {
    backgroundColor: '#E3F4EB',
    borderWidth: 1,
    borderColor: '#CEE8DA'
  },

  navText: {
    color: MUTED,
    fontSize: 13,
    fontWeight: '800'
  },

  navOn: {
    color: PRIMARY
  }

});
