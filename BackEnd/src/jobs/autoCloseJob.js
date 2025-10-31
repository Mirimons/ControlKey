import cron from 'node-cron'
import controlService from '../services/controlService.js'

class AutoCloseJob {
    init() {
        cron.schedule('0 23 59 59 999', async() => {
            try {
                console.log('Iniciando fechamento automático diário...')
                const result = await controlService.autoCloseControl()
                console.log('Fechamento automático concluído: ', result)
            }catch(error) {
                console.error('Erro no job de fechamento automático: ', error)
            }
        }, {
            timezone: "America/Sao_Paulo"
        });
        console.log('Job de fechamento automático agendado para 00:00 diariamente')
    }
}

export default new AutoCloseJob();